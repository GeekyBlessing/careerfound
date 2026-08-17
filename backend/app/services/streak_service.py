import uuid
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.progress import Streak


async def touch_streak(db: AsyncSession, user_id: uuid.UUID) -> Streak:
    today = date.today()
    result = await db.execute(select(Streak).where(Streak.user_id == user_id))
    streak = result.scalar_one_or_none()
    if streak is None:
        streak = Streak(user_id=user_id, current_streak_days=1, longest_streak_days=1, last_active_date=today)
        db.add(streak)
        return streak

    if streak.last_active_date == today:
        return streak
    if streak.last_active_date == today - timedelta(days=1):
        streak.current_streak_days += 1
    else:
        streak.current_streak_days = 1
    streak.longest_streak_days = max(streak.longest_streak_days, streak.current_streak_days)
    streak.last_active_date = today
    return streak


async def get_streak(db: AsyncSession, user_id: uuid.UUID) -> Streak | None:
    result = await db.execute(select(Streak).where(Streak.user_id == user_id))
    return result.scalar_one_or_none()
