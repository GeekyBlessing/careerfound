import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.progress import DailyMission, ProgressStatus
from app.models.roadmap import Exercise, Lesson, Project, Quiz, Roadmap, RoadmapPhase, RoadmapStatus
from app.services import readiness_service, roadmap_service
from app.services.streak_service import get_streak


async def _next_incomplete_items(db: AsyncSession, path_id: uuid.UUID, user_id: uuid.UUID, limit: int = 4) -> list[dict]:
    progress_map = await roadmap_service.get_progress_map(db, user_id)
    phases = (
        (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path_id).order_by(RoadmapPhase.order_index)))
        .scalars()
        .all()
    )

    tasks: list[dict] = []
    for phase in phases:
        lessons = (await db.execute(select(Lesson).where(Lesson.phase_id == phase.id).order_by(Lesson.order_index))).scalars().all()
        for lesson in lessons:
            if progress_map.get(str(lesson.id)) != ProgressStatus.completed:
                exercises = (await db.execute(select(Exercise).where(Exercise.lesson_id == lesson.id))).scalars().all()
                tasks.append(
                    {"type": "learn", "title": f"Learn: {lesson.title}", "est_minutes": lesson.est_minutes, "ref_id": str(lesson.id)}
                )
                for ex in exercises:
                    if progress_map.get(str(ex.id)) != ProgressStatus.completed:
                        tasks.append(
                            {"type": "practice", "title": f"Practice: {ex.prompt[:60]}", "est_minutes": ex.est_minutes, "ref_id": str(ex.id)}
                        )
                if len(tasks) >= limit:
                    return tasks[:limit]
                break  # only pull one incomplete lesson per phase pass, then re-check projects below
        projects = (await db.execute(select(Project).where(Project.phase_id == phase.id).order_by(Project.order_index))).scalars().all()
        for project in projects:
            if progress_map.get(str(project.id)) != ProgressStatus.completed:
                tasks.append(
                    {"type": "challenge", "title": f"Challenge: {project.title}", "est_minutes": 45, "ref_id": str(project.id)}
                )
                break
        if len(tasks) >= limit:
            return tasks[:limit]
        quizzes = (await db.execute(select(Quiz).where(Quiz.phase_id == phase.id))).scalars().all()
        for quiz in quizzes:
            if progress_map.get(str(quiz.id)) != ProgressStatus.completed:
                # Seeded quiz titles already read "Checkpoint: <Phase>" (see
                # app/seed/roadmap_content.py) — avoid double-prefixing here.
                task_title = quiz.title if quiz.title.lower().startswith("checkpoint") else f"Checkpoint: {quiz.title}"
                tasks.append(
                    {"type": "reflection", "title": task_title, "est_minutes": 10, "ref_id": str(quiz.id)}
                )
                break
        if tasks:
            break  # stop at the first phase with incomplete work — that's today's focus phase

    if not tasks:
        tasks = [{"type": "reflection", "title": "You're caught up! Revisit a past project and polish your portfolio.", "est_minutes": 20, "ref_id": None}]
    return tasks[:limit]


async def get_or_generate_today_mission(db: AsyncSession, user_id: uuid.UUID, path_id: uuid.UUID, path_name: str) -> DailyMission:
    today = date.today()
    result = await db.execute(select(DailyMission).where(DailyMission.user_id == user_id, DailyMission.date == today))
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    tasks = await _next_incomplete_items(db, path_id, user_id)
    total_minutes = sum(t["est_minutes"] for t in tasks)
    rationale = (
        f"This is today's focus because it's the next unfinished step in your {path_name} roadmap. "
        "Completing it in order keeps each new concept building on one you've already got, instead of "
        "jumping around and leaving gaps."
    )
    mission = DailyMission(user_id=user_id, date=today, tasks=tasks, rationale_text=rationale)
    db.add(mission)
    await db.commit()
    await db.refresh(mission)
    return mission


async def build_dashboard(db: AsyncSession, user) -> dict:
    roadmap_result = await db.execute(
        select(Roadmap).where(Roadmap.user_id == user.id, Roadmap.status == RoadmapStatus.active).order_by(Roadmap.created_at.desc())
    )
    roadmap = roadmap_result.scalars().first()

    first_name = user.full_name.split(" ")[0] if user.full_name else "there"
    hour = date.today()  # kept simple/deterministic; frontend can localize greeting by time-of-day
    greeting = f"Welcome back, {first_name}."

    streak = await get_streak(db, user.id)
    streak_days = streak.current_streak_days if streak else 0

    if roadmap is None:
        return {
            "greeting": greeting,
            "has_active_roadmap": False,
            "path_name": None,
            "path_slug": None,
            "today_mission": None,
            "readiness": None,
            "current_streak_days": streak_days,
            "current_project_title": None,
            "upcoming_milestone": None,
            "recommended_next_action": "Take the 'Find Your Tech Path' assessment to get your personalized roadmap.",
        }

    path = (await db.execute(select(CareerPath).where(CareerPath.id == roadmap.path_id))).scalar_one()
    mission = await get_or_generate_today_mission(db, user.id, path.id, path.name)
    readiness = await readiness_service.compute_readiness(db, user.id, path_id=path.id)

    current_project = None
    progress_map = await roadmap_service.get_progress_map(db, user.id)
    phases = (
        (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id).order_by(RoadmapPhase.order_index)))
        .scalars()
        .all()
    )
    for phase in phases:
        projects = (await db.execute(select(Project).where(Project.phase_id == phase.id).order_by(Project.order_index))).scalars().all()
        for project in projects:
            if progress_map.get(str(project.id)) != ProgressStatus.completed:
                current_project = project.title
                break
        if current_project:
            break

    next_phase = None
    for phase in phases:
        lessons_done = all(
            progress_map.get(str(lid)) == ProgressStatus.completed
            for lid in [
                l.id for l in (await db.execute(select(Lesson.id).where(Lesson.phase_id == phase.id))).all()
            ]
        )
        if not lessons_done:
            next_phase = phase.title
            break

    return {
        "greeting": greeting,
        "has_active_roadmap": True,
        "path_name": path.name,
        "path_slug": path.slug,
        "today_mission": {
            "date": mission.date.isoformat(),
            "total_minutes": sum(t["est_minutes"] for t in mission.tasks),
            "tasks": mission.tasks,
            "rationale": mission.rationale_text,
        },
        "readiness": {
            "overall": readiness.overall,
            "knowledge_pct": readiness.knowledge_pct,
            "projects_pct": readiness.projects_pct,
            "portfolio_pct": readiness.portfolio_pct,
            "interview_pct": readiness.interview_pct,
            "practical_pct": readiness.practical_pct,
            "next_actions": readiness.next_actions,
        },
        "current_streak_days": streak_days,
        "current_project_title": current_project,
        "upcoming_milestone": next_phase,
        "recommended_next_action": mission.tasks[0]["title"] if mission.tasks else "You're all caught up for today.",
    }
