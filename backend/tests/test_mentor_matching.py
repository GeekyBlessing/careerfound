import uuid

import pytest
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.career import CareerPath
from app.models.marketplace import ApplicationStatus, Mentor, MentorApplication
from app.models.roadmap import SkillNode
from app.models.user import Role, User
from app.services import marketplace_service, mentor_matching_service, skill_gap_service

pytestmark = pytest.mark.asyncio


async def _seed_path_with_skills(db) -> CareerPath:
    path = CareerPath(slug="test-path", name="Test Path", summary="s")
    db.add(path)
    await db.flush()
    db.add_all(
        [
            SkillNode(path_id=path.id, key="foo", label="Foo Fundamentals", category="foundation"),
            SkillNode(path_id=path.id, key="bar", label="Bar Basics", category="core"),
        ]
    )
    await db.commit()
    return path


async def _seed_user(db, email="learner@example.com") -> User:
    user = User(email=email, full_name="Learner One", password_hash="x")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def test_skill_snapshot_beginner_with_no_progress():
    async with AsyncSessionLocal() as db:
        path = await _seed_path_with_skills(db)
        user = await _seed_user(db)
        snapshot = await skill_gap_service.get_skill_snapshot(db, user, path.slug)
    assert snapshot["level"] == "Beginner"
    assert snapshot["mastery_avg"] == 0
    assert {g["key"] for g in snapshot["gaps"]} == {"foo", "bar"}


async def test_skill_snapshot_unknown_path_raises():
    async with AsyncSessionLocal() as db:
        user = await _seed_user(db)
        with pytest.raises(skill_gap_service.UnknownPathError):
            await skill_gap_service.get_skill_snapshot(db, user, "not-a-real-path")


async def test_beginner_focused_mentor_outranks_generalist_for_a_beginner():
    async with AsyncSessionLocal() as db:
        path = await _seed_path_with_skills(db)
        user = await _seed_user(db)

        beginner_mentor = Mentor(
            display_name="Beginner Friendly",
            headline="h",
            paths=[path.slug],
            focus_beginner_friendly=True,
            is_founding_mentor=True,
            years_experience=None,
        )
        generalist_mentor = Mentor(
            display_name="Generalist",
            headline="h",
            paths=[path.slug],
            focus_beginner_friendly=False,
            years_experience=10,
        )
        db.add_all([beginner_mentor, generalist_mentor])
        await db.commit()

        result = await mentor_matching_service.recommend_mentors_for_user(db, user, path.slug)

    assert result["snapshot"]["level"] == "Beginner"
    ranked_names = [m["mentor"].display_name for m in result["matches"]]
    assert ranked_names[0] == "Beginner Friendly"
    top_reason = result["matches"][0]["reason"]
    assert "Foo Fundamentals" in top_reason or "Bar Basics" in top_reason


async def test_mentee_summary_reflects_structured_profile_data():
    async with AsyncSessionLocal() as db:
        user = await _seed_user(db, email="summary@example.com")
        user.time_budget_minutes_per_day = 60
        await db.commit()

        summary = await marketplace_service.generate_mentee_summary(
            db, user, "start_cybersecurity", "I don't know where to begin."
        )
    assert "getting started in cybersecurity" in summary
    assert "1.0 hour" in summary or "1 hour" in summary
    assert "I don't know where to begin." in summary


async def test_claim_flow_links_account_and_grants_mentor_role(client):
    async with AsyncSessionLocal() as db:
        mentor = Mentor(display_name="Claimable", headline="h", contact_email="claimme@example.com")
        db.add(mentor)
        await db.commit()

    register = await client.post(
        "/api/v1/auth/register",
        json={"email": "claimme@example.com", "password": "SecurePass123!", "full_name": "Claim Me"},
    )
    token = register.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Before claiming, the mentor dashboard is off-limits.
    denied = await client.get("/api/v1/mentors/me/sessions", headers=headers)
    assert denied.status_code == 403

    claimed = await client.post("/api/v1/mentors/claim", headers=headers)
    assert claimed.status_code == 200
    assert claimed.json()["display_name"] == "Claimable"

    allowed = await client.get("/api/v1/mentors/me/sessions", headers=headers)
    assert allowed.status_code == 200

    async with AsyncSessionLocal() as db:
        user = (await db.execute(select(User).where(User.email == "claimme@example.com"))).scalar_one()
    assert user.role == Role.mentor

    # A second claim attempt (no unclaimed row left for this email) 404s.
    second = await client.post("/api/v1/mentors/claim", headers=headers)
    assert second.status_code == 404


async def test_application_approve_then_claim(client):
    apply_resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "applicant_login@example.com", "password": "SecurePass123!", "full_name": "Applicant"},
    )
    applicant_headers = {"Authorization": f"Bearer {apply_resp.json()['access_token']}"}

    submitted = await client.post(
        "/api/v1/mentor-applications",
        headers=applicant_headers,
        json={
            "applicant_name": "Applicant Person",
            "applicant_email": "applicant@example.com",
            "headline": "Data Engineer",
            "bio": "Wants to mentor.",
            "paths": ["software-engineering"],
            "years_experience": 4,
        },
    )
    assert submitted.status_code == 201
    application_id = submitted.json()["id"]
    assert submitted.json()["status"] == "pending"

    # Non-admins can't approve.
    denied = await client.post(
        f"/api/v1/mentor-applications/{application_id}/approve", headers=applicant_headers, json={}
    )
    assert denied.status_code == 403

    admin_register = await client.post(
        "/api/v1/auth/register",
        json={"email": "admin_test@example.com", "password": "SecurePass123!", "full_name": "Admin"},
    )
    admin_id = admin_register.json()["access_token"]
    async with AsyncSessionLocal() as db:
        admin_user = (
            await db.execute(select(User).where(User.email == "admin_test@example.com"))
        ).scalar_one()
        admin_user.role = Role.admin
        await db.commit()
    admin_headers = {"Authorization": f"Bearer {admin_id}"}

    approved = await client.post(
        f"/api/v1/mentor-applications/{application_id}/approve", headers=admin_headers, json={"reviewer_note": "ok"}
    )
    assert approved.status_code == 200
    approved_body = approved.json()
    assert approved_body["is_verified"] is False
    assert approved_body["is_demo"] is False

    applicant_login = await client.post(
        "/api/v1/auth/register",
        json={"email": "applicant@example.com", "password": "SecurePass123!", "full_name": "Applicant Person"},
    )
    new_mentor_headers = {"Authorization": f"Bearer {applicant_login.json()['access_token']}"}
    claimed = await client.post("/api/v1/mentors/claim", headers=new_mentor_headers)
    assert claimed.status_code == 200
    assert claimed.json()["display_name"] == "Applicant Person"
