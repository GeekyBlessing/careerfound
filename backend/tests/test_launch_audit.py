"""Launch-audit fixes: sample accounts stay out of production, mentor requests
reach a person, user text cannot inject markup into the team inbox, and the
public leaderboard no longer lists everyone's full name."""

import pytest
from sqlalchemy import select

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.career import CareerPath
from app.models.community import Community, CommunityPost
from app.models.progress import XPEvent
from app.models.user import User
from app.seed.mentors import UIUX_MENTOR
from app.seed.seed_data import seed_career_paths, seed_communities, seed_mentors, seed_users
from app.services import email_service


@pytest.fixture
def email_spy(monkeypatch):
    sent = []

    async def fake_send_email(message):
        sent.append(message)
        return True

    monkeypatch.setattr(email_service, "send_email", fake_send_email)
    return sent


async def _register(client, email="learner@example.com", name="Ife Adeyemi"):
    r = await client.post("/api/v1/auth/register", json={"email": email, "password": "Journey123!", "full_name": name})
    assert r.status_code == 201
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_sample_accounts_are_off_in_production_and_on_elsewhere(monkeypatch):
    monkeypatch.setattr(settings, "SEED_DEMO_DATA", None)
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    assert settings.seed_demo_data is False
    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    assert settings.seed_demo_data is True
    monkeypatch.setattr(settings, "SEED_DEMO_DATA", True)
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    assert settings.seed_demo_data is True  # an explicit choice always wins


@pytest.mark.asyncio
async def test_communities_can_be_created_without_sample_posts():
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_communities(db, paths)
        assert (await db.execute(select(Community))).scalars().first() is not None
        assert (await db.execute(select(CommunityPost))).scalars().first() is None


@pytest.mark.asyncio
async def test_leaderboard_needs_sign_in_shortens_names_and_hides_samples_in_production(client, monkeypatch):
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        users = await seed_users(db)
        await seed_communities(db, paths, users["demo@careerfound.dev"])
    headers = await _register(client)
    async with AsyncSessionLocal() as db:
        real = (await db.execute(select(User).where(User.email == "learner@example.com"))).scalar_one()
        sample = (await db.execute(select(User).where(User.email == "demo@careerfound.dev"))).scalar_one()
        for uid, amount in ((real.id, 40), (sample.id, 90)):
            db.add(XPEvent(user_id=uid, amount=amount, reason="lesson"))
        await db.commit()

    assert (await client.get("/api/v1/communities/cybersecurity/leaderboard")).status_code in (401, 403)

    board = (await client.get("/api/v1/communities/cybersecurity/leaderboard", headers=headers)).json()
    assert [e["user_name"] for e in board] == ["Amara C.", "Ife A."]  # first name and last initial, nobody with 0 XP

    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    board = (await client.get("/api/v1/communities/cybersecurity/leaderboard", headers=headers)).json()
    assert [e["user_name"] for e in board] == ["Ife A."]
    posts = (await client.get("/api/v1/communities/cybersecurity/posts")).json()
    assert posts == []  # the seeded sample posts are not shown as member posts


@pytest.mark.asyncio
async def test_a_mentor_request_is_announced_to_the_team_and_confirmed_to_the_requester(client, email_spy):
    async with AsyncSessionLocal() as db:
        await seed_mentors(db)
    headers = await _register(client)
    mentor = (await client.get("/api/v1/mentors/olusegun-adesanya")).json()

    resp = await client.post(
        f"/api/v1/mentors/{mentor['id']}/sessions",
        headers=headers,
        json={"scheduled_at": "2030-01-01T10:00:00+00:00", "duration_minutes": 30, "help_topic": "career_direction", "message": "I want the 2 month program"},
    )
    assert resp.status_code == 201
    assert resp.json()["team_notified"] is True and resp.json()["price_cents"] == 0

    recipients = [m.to for m in email_spy]
    assert settings.EMAIL_REPLY_TO in recipients and "learner@example.com" in recipients
    team_mail = next(m for m in email_spy if m.to == settings.EMAIL_REPLY_TO)
    assert "Olusegun Adesanya" in team_mail.subject and "2 month program" in team_mail.html
    receipt = next(m for m in email_spy if m.to == "learner@example.com" and "We received" in m.subject)
    assert "nothing has been charged" in receipt.text.lower()


@pytest.mark.asyncio
async def test_a_question_is_announced_too_and_reports_when_email_failed(client, monkeypatch):
    async with AsyncSessionLocal() as db:
        await seed_mentors(db)
    headers = await _register(client)

    async def failing(message):
        return False

    monkeypatch.setattr(email_service, "send_email", failing)
    mentor_id = (await client.get("/api/v1/mentors/olusegun-adesanya")).json()["id"]
    resp = await client.post(f"/api/v1/mentors/{mentor_id}/questions", headers=headers, json={"message": "Where do I start?"})
    assert resp.status_code == 201  # still saved
    assert resp.json()["team_notified"] is False  # and honest about the failed email


@pytest.mark.asyncio
async def test_user_text_cannot_inject_markup_into_the_team_email(client, email_spy):
    resp = await client.post(
        "/api/v1/service-requests",
        json={"name": "<b>Eve</b>", "email": "eve@example.com", "service": "consultation", "message": '<a href="https://evil.example">pay now</a>'},
    )
    assert resp.status_code == 201
    assert resp.json()["team_notified"] is True and resp.json()["confirmation_sent"] is True
    team_mail = next(m for m in email_spy if m.to == settings.EMAIL_REPLY_TO)
    assert 'href="https://evil.example"' not in team_mail.html and "&lt;a href" in team_mail.html
    assert "<b>Eve</b>" not in team_mail.html


def test_uiux_mentor_constant_still_present():
    assert UIUX_MENTOR["slug"] == "olusegun-adesanya"


@pytest.mark.asyncio
async def test_warns_when_sample_accounts_still_use_published_passwords():
    from app.core.security import hash_password
    from app.seed.seed_data import warn_if_sample_accounts_use_published_passwords

    async with AsyncSessionLocal() as db:
        await seed_users(db)
        assert sorted(await warn_if_sample_accounts_use_published_passwords(db)) == [
            "admin@careerfound.dev", "demo@careerfound.dev", "newuser@careerfound.dev",
        ]
        admin = (await db.execute(select(User).where(User.email == "admin@careerfound.dev"))).scalar_one()
        admin.password_hash = hash_password("a-new-private-password-1")
        await db.commit()
        assert "admin@careerfound.dev" not in await warn_if_sample_accounts_use_published_passwords(db)


@pytest.mark.asyncio
async def test_a_request_is_not_a_mentee_until_the_mentor_confirms(client, email_spy):
    from app.seed.mentors import FOUNDING_MENTOR_EMAIL

    async with AsyncSessionLocal() as db:
        await seed_mentors(db)
    mentor_headers = await _register(client, email=FOUNDING_MENTOR_EMAIL, name="Toriola Opeyemi")
    claim = await client.post("/api/v1/mentors/claim", headers=mentor_headers)
    assert claim.status_code in (200, 201), claim.text
    learner = await _register(client)
    mentor = (await client.get("/api/v1/mentors/toriola-opeyemi")).json()
    before = mentor["mentee_count"]

    ids = []
    for day in ("2030-01-01", "2030-01-02"):
        r = await client.post(
            f"/api/v1/mentors/{mentor['id']}/sessions",
            headers=learner,
            json={"scheduled_at": f"{day}T10:00:00+00:00", "duration_minutes": 30, "help_topic": "career_direction", "message": "hi"},
        )
        ids.append(r.json()["id"])
    assert (await client.get("/api/v1/mentors/toriola-opeyemi")).json()["mentee_count"] == before  # requests only

    for session_id in ids:  # the same person confirmed twice still counts once
        r = await client.patch(f"/api/v1/mentors/me/sessions/{session_id}/status", headers=mentor_headers, json={"status": "confirmed"})
        assert r.status_code == 200, r.text
    assert (await client.get("/api/v1/mentors/toriola-opeyemi")).json()["mentee_count"] == before + 1
