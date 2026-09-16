import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, ReadinessScore, UserProgress, UserSimulationAttempt
from app.models.roadmap import Lesson, Project, Quiz, Roadmap, RoadmapPhase, RoadmapStatus

WEIGHTS = {
    "knowledge_pct": 0.25,
    "projects_pct": 0.30,
    "portfolio_pct": 0.15,
    "interview_pct": 0.15,
    "practical_pct": 0.15,
}


async def _active_path_id(db: AsyncSession, user_id: uuid.UUID) -> uuid.UUID | None:
    result = await db.execute(
        select(Roadmap.path_id)
        .where(Roadmap.user_id == user_id, Roadmap.status == RoadmapStatus.active)
        .order_by(Roadmap.created_at.desc())
    )
    return result.scalars().first()


async def compute_readiness(db: AsyncSession, user_id: uuid.UUID, path_id: uuid.UUID | None = None) -> ReadinessScore:
    """Readiness is scored against the user's own active career path, not
    every lesson/project/quiz on the platform, otherwise a user on a
    smaller path than the platform's largest would be structurally capped
    below 100% no matter how much of their own path they finish. Callers
    that already know the active path_id (e.g. dashboard_service, which
    already loaded the user's Roadmap) should pass it in; otherwise it's
    looked up here from the user's active Roadmap. No active roadmap means
    every percentage is legitimately 0, same as before this fix.
    """
    if path_id is None:
        path_id = await _active_path_id(db, user_id)

    phase_ids_subq = select(RoadmapPhase.id).where(RoadmapPhase.path_id == path_id).scalar_subquery() if path_id else None

    if phase_ids_subq is not None:
        total_lessons = (await db.execute(select(func.count(Lesson.id)).where(Lesson.phase_id.in_(phase_ids_subq)))).scalar_one()
        total_projects = (await db.execute(select(func.count(Project.id)).where(Project.phase_id.in_(phase_ids_subq)))).scalar_one()
        total_quizzes = (await db.execute(select(func.count(Quiz.id)).where(Quiz.phase_id.in_(phase_ids_subq)))).scalar_one()
    else:
        total_lessons = total_projects = total_quizzes = 0

    done_lessons = (
        await db.execute(
            select(func.count(UserProgress.id))
            .select_from(UserProgress)
            .join(Lesson, Lesson.id == UserProgress.lesson_id)
            .where(
                UserProgress.user_id == user_id,
                UserProgress.lesson_id.isnot(None),
                UserProgress.status == ProgressStatus.completed,
                Lesson.phase_id.in_(phase_ids_subq) if phase_ids_subq is not None else False,
            )
        )
    ).scalar_one()
    done_projects = (
        await db.execute(
            select(func.count(UserProgress.id))
            .select_from(UserProgress)
            .join(Project, Project.id == UserProgress.project_id)
            .where(
                UserProgress.user_id == user_id,
                UserProgress.project_id.isnot(None),
                UserProgress.status == ProgressStatus.completed,
                Project.phase_id.in_(phase_ids_subq) if phase_ids_subq is not None else False,
            )
        )
    ).scalar_one()
    done_quizzes = (
        await db.execute(
            select(func.count(UserProgress.id))
            .select_from(UserProgress)
            .join(Quiz, Quiz.id == UserProgress.quiz_id)
            .where(
                UserProgress.user_id == user_id,
                UserProgress.quiz_id.isnot(None),
                UserProgress.status == ProgressStatus.completed,
                Quiz.phase_id.in_(phase_ids_subq) if phase_ids_subq is not None else False,
            )
        )
    ).scalar_one()

    portfolio_count = (
        await db.execute(select(func.count(PortfolioItem.id)).where(PortfolioItem.user_id == user_id))
    ).scalar_one()

    sim_total = (
        await db.execute(select(func.count(UserSimulationAttempt.id)).where(UserSimulationAttempt.user_id == user_id))
    ).scalar_one()
    sim_correct = (
        await db.execute(
            select(func.count(UserSimulationAttempt.id)).where(
                UserSimulationAttempt.user_id == user_id, UserSimulationAttempt.correct.is_(True)
            )
        )
    ).scalar_one()

    knowledge_pct = _safe_pct(done_lessons, total_lessons)
    projects_pct = _safe_pct(done_projects, total_projects)
    practical_pct = _safe_pct(done_quizzes, total_quizzes)
    portfolio_pct = min(100, portfolio_count * 25)  # 4 solid portfolio pieces = 100%
    interview_pct = _safe_pct(sim_correct, max(sim_total, 1)) if sim_total else min(20, sim_total)

    overall = round(
        knowledge_pct * WEIGHTS["knowledge_pct"]
        + projects_pct * WEIGHTS["projects_pct"]
        + portfolio_pct * WEIGHTS["portfolio_pct"]
        + interview_pct * WEIGHTS["interview_pct"]
        + practical_pct * WEIGHTS["practical_pct"]
    )

    next_actions = _next_actions(knowledge_pct, projects_pct, portfolio_pct, interview_pct, practical_pct)

    # This is called on every dashboard/readiness-score view, so it must not
    # insert a fresh row per view (that grew the table unbounded with no
    # code anywhere ever reading the history back). Nothing in the app
    # relies on a row-per-computation trail, so update the user's existing
    # row in place and only insert the first time.
    score = (
        await db.execute(
            select(ReadinessScore).where(ReadinessScore.user_id == user_id).order_by(ReadinessScore.created_at.desc())
        )
    ).scalars().first()
    if score is None:
        score = ReadinessScore(user_id=user_id)
        db.add(score)

    score.overall = overall
    score.knowledge_pct = knowledge_pct
    score.projects_pct = projects_pct
    score.portfolio_pct = portfolio_pct
    score.interview_pct = interview_pct
    score.practical_pct = practical_pct
    score.next_actions = next_actions

    await db.commit()
    await db.refresh(score)
    return score


def _safe_pct(done: int, total: int) -> int:
    if total <= 0:
        return 0
    return round((done / total) * 100)


def _next_actions(knowledge: int, projects: int, portfolio: int, interview: int, practical: int) -> list[str]:
    dims = {
        "knowledge": (knowledge, "Complete two more lessons this week to lift your knowledge score."),
        "projects": (projects, "Ship your next mini-project: projects carry the most weight in your score."),
        "portfolio": (portfolio, "Generate a portfolio write-up for a completed project, it's a quick, high-leverage win."),
        "interview": (interview, "Try a real-world simulation scenario to build interview readiness."),
        "practical": (practical, "Pass a checkpoint quiz to prove practical mastery of your current phase."),
    }
    ranked = sorted(dims.items(), key=lambda kv: kv[1][0])
    return [ranked[0][1][1], ranked[1][1][1]]
