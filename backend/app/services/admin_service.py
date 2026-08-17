from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment import Assessment
from app.models.career import CareerPath
from app.models.marketplace import MentorSession
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Lesson, Project, Roadmap
from app.models.user import User


async def get_overview(db: AsyncSession) -> dict:
    now = datetime.now(timezone.utc)
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()

    dau = (
        await db.execute(select(func.count(User.id)).where(User.last_active_at >= now - timedelta(days=1)))
    ).scalar_one()

    wau_cutoff = now - timedelta(days=7)
    recent_progress = await db.execute(
        select(func.count(func.distinct(UserProgress.user_id))).where(UserProgress.updated_at >= wau_cutoff)
    )
    weekly_active = recent_progress.scalar_one()

    total_assessments = (await db.execute(select(func.count(Assessment.id)))).scalar_one()
    total_roadmaps = (await db.execute(select(func.count(Roadmap.id)))).scalar_one()

    total_projects_completed = (
        await db.execute(
            select(func.count(UserProgress.id)).where(
                UserProgress.project_id.isnot(None), UserProgress.status == ProgressStatus.completed
            )
        )
    ).scalar_one()
    total_lessons_completed = (
        await db.execute(
            select(func.count(UserProgress.id)).where(
                UserProgress.lesson_id.isnot(None), UserProgress.status == ProgressStatus.completed
            )
        )
    ).scalar_one()

    path_counts = await db.execute(
        select(CareerPath.name, func.count(Roadmap.id))
        .join(Roadmap, Roadmap.path_id == CareerPath.id)
        .group_by(CareerPath.name)
        .order_by(func.count(Roadmap.id).desc())
    )
    most_popular = [{"path": name, "roadmaps_started": count} for name, count in path_counts.all()]

    total_lessons = (await db.execute(select(func.count(Lesson.id)))).scalar_one()
    completion_rate = round((total_lessons_completed / total_lessons) * 100, 1) if total_lessons else 0.0

    sessions_booked = (await db.execute(select(func.count(MentorSession.id)))).scalar_one()

    drop_off = await db.execute(
        select(Lesson.phase_id, func.count(Lesson.id)).group_by(Lesson.phase_id)
    )
    drop_off_rows = [{"phase_id": str(pid), "lesson_count": count} for pid, count in drop_off.all()]

    return {
        "total_users": total_users,
        "daily_active_users": dau,
        "weekly_active_users": weekly_active,
        "total_assessments_completed": total_assessments,
        "total_roadmaps_started": total_roadmaps,
        "total_projects_completed": total_projects_completed,
        "total_lessons_completed": total_lessons_completed,
        "most_popular_paths": most_popular,
        "completion_rate_pct": completion_rate,
        "mentor_sessions_booked": sessions_booked,
        "drop_off_by_phase": drop_off_rows,
    }
