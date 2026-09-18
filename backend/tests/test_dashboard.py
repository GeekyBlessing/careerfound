from datetime import datetime, timedelta, timezone

import pytest

from app.db.session import AsyncSessionLocal
from app.models.progress import XPEvent
from app.models.user import User
from app.services import dashboard_service

pytestmark = pytest.mark.asyncio


async def _seed_user(db, email="dashboard-user@example.com") -> User:
    user = User(email=email, full_name="Dashboard User", password_hash="x")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def test_recent_activity_is_empty_for_a_brand_new_user():
    async with AsyncSessionLocal() as db:
        user = await _seed_user(db)
        activity = await dashboard_service._get_recent_activity(db, user.id)
    assert activity == []


async def test_recent_activity_returns_real_events_newest_first():
    async with AsyncSessionLocal() as db:
        user = await _seed_user(db, email="dashboard-user-2@example.com")
        # created_at is set explicitly (rather than relying on the
        # server_default clock) so ordering is deterministic even when both
        # rows land in the same wall-clock second, which SQLite's timestamp
        # resolution makes easy to hit in a fast test run.
        now = datetime.now(timezone.utc)
        db.add(
            XPEvent(
                user_id=user.id,
                amount=10,
                reason="Completed lesson: Intro to Networking",
                created_at=now - timedelta(minutes=5),
            )
        )
        db.add(
            XPEvent(
                user_id=user.id,
                amount=40,
                reason="Completed project: Build a firewall rule set",
                created_at=now,
            )
        )
        await db.commit()

        activity = await dashboard_service._get_recent_activity(db, user.id)

    assert [a["label"] for a in activity] == [
        "Completed project: Build a firewall rule set",
        "Completed lesson: Intro to Networking",
    ]
    assert activity[0]["created_at"] >= activity[1]["created_at"]


async def test_recent_activity_never_mixes_in_another_users_events():
    async with AsyncSessionLocal() as db:
        user = await _seed_user(db, email="dashboard-user-3@example.com")
        other = await _seed_user(db, email="dashboard-user-4@example.com")
        db.add(XPEvent(user_id=other.id, amount=10, reason="Completed lesson: Someone else's lesson"))
        await db.commit()

        activity = await dashboard_service._get_recent_activity(db, user.id)

    assert activity == []


async def test_build_dashboard_includes_recent_activity_with_no_active_roadmap():
    async with AsyncSessionLocal() as db:
        user = await _seed_user(db, email="dashboard-user-5@example.com")
        db.add(XPEvent(user_id=user.id, amount=5, reason="Completed practice exercise"))
        await db.commit()

        payload = await dashboard_service.build_dashboard(db, user)

    assert payload["has_active_roadmap"] is False
    assert payload["recent_activity"][0]["label"] == "Completed practice exercise"
