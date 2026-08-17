import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, ReadinessScore, UserProgress, UserSimulationAttempt
from app.models.roadmap import Lesson, Project, Quiz

WEIGHTS = {
    "knowledge_pct": 0.25,
    "projects_pct": 0.30,
    "portfolio_pct": 0.15,
    "interview_pct": 0.15,
    "practical_pct": 0.15,
}


async def compute_readiness(db: AsyncSession, user_id: uuid.UUID) -> ReadinessScore:
    total_lessons = (await db.execute(select(func.count(Lesson.id)))).scalar_one()
    total_projects = (await db.execute(select(func.count(Project.id)))).scalar_one()
    total_quizzes = (await db.execute(select(func.count(Quiz.id)))).scalar_one()

    done_lessons = (
        await db.execute(
            select(func.count(UserProgress.id)).where(
                UserProgress.user_id == user_id,
                UserProgress.lesson_id.isnot(None),
                UserProgress.status == ProgressStatus.completed,
            )
        )
    ).scalar_one()
    done_projects = (
        await db.execute(
            select(func.count(UserProgress.id)).where(
                UserProgress.user_id == user_id,
                UserProgress.project_id.isnot(None),
                UserProgress.status == ProgressStatus.completed,
            )
        )
    ).scalar_one()
    done_quizzes = (
        await db.execute(
            select(func.count(UserProgress.id)).where(
                UserProgress.user_id == user_id,
                UserProgress.quiz_id.isnot(None),
                UserProgress.status == ProgressStatus.completed,
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

    score = ReadinessScore(
        user_id=user_id,
        overall=overall,
        knowledge_pct=knowledge_pct,
        projects_pct=projects_pct,
        portfolio_pct=portfolio_pct,
        interview_pct=interview_pct,
        practical_pct=practical_pct,
        next_actions=next_actions,
    )
    db.add(score)
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
        "projects": (projects, "Ship your next mini-project — projects carry the most weight in your score."),
        "portfolio": (portfolio, "Generate a portfolio write-up for a completed project — it's a quick, high-leverage win."),
        "interview": (interview, "Try a real-world simulation scenario to build interview readiness."),
        "practical": (practical, "Pass a checkpoint quiz to prove practical mastery of your current phase."),
    }
    ranked = sorted(dims.items(), key=lambda kv: kv[1][0])
    return [ranked[0][1][1], ranked[1][1][1]]
