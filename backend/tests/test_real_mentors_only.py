"""Seeded demo personas are never public marketplace content; only the real,
verified mentors are listed, viewable, matched and bookable."""

import pytest
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.marketplace import Mentor
from app.seed.mentors import FOUNDING_MENTOR, FULLSTACK_MENTOR
from app.seed.seed_data import seed_mentors

pytestmark = pytest.mark.asyncio


async def test_public_listing_contains_only_the_real_mentors(client):
    async with AsyncSessionLocal() as db:
        await seed_mentors(db)
        demo_count = len((await db.execute(select(Mentor).where(Mentor.is_demo.is_(True)))).scalars().all())
    assert demo_count > 0, "demo personas stay in the database, just hidden"

    listing = (await client.get("/api/v1/mentors")).json()
    assert {m["display_name"] for m in listing} == {"Toriola Opeyemi", "David Oladotun Egundeyi"}
    assert all(m["is_demo"] is False for m in listing)

    # Filtering by a career a demo persona used to cover returns no demo mentor.
    # Toriola is the real mentor for cybersecurity, cloud security and DevOps.
    for career in ("cybersecurity", "cloud-security", "devops-engineering"):
        found = (await client.get("/api/v1/mentors", params={"path": career})).json()
        assert [m["display_name"] for m in found] == ["Toriola Opeyemi"], career
    assert (await client.get("/api/v1/mentors", params={"path": "data-science"})).json() == []


async def test_a_demo_mentor_is_a_404_by_id_and_cannot_be_booked(client):
    async with AsyncSessionLocal() as db:
        await seed_mentors(db)
        demo = (await db.execute(select(Mentor).where(Mentor.is_demo.is_(True)))).scalars().first()
        demo_id = str(demo.id)
    assert (await client.get(f"/api/v1/mentors/{demo_id}")).status_code == 404
    assert (await client.get(f"/api/v1/mentors/{demo_id}/reviews")).json() == []


async def test_real_mentor_profiles_carry_the_verified_positioning(client):
    async with AsyncSessionLocal() as db:
        await seed_mentors(db)
    toriola = next(m for m in (await client.get("/api/v1/mentors")).json() if m["display_name"] == "Toriola Opeyemi")
    assert toriola["headline"] == "Cybersecurity, Cloud Security & DevOps Mentor"
    assert toriola["paths"] == ["cybersecurity", "cloud-security", "devops-engineering", "aws-security", "security-automation", "devsecops"]
    assert toriola["is_founding_mentor"] is True
    assert toriola["mentorship_price_label"] == "₦250,000 ($200)"
    assert toriola["mentorship_duration_label"] == "2 months"

    dotun = (await client.get("/api/v1/mentors/mobile-engineering-mentor")).json()
    assert dotun["display_name"] == "David Oladotun Egundeyi"
    assert dotun["headline"] == "Full-Stack Engineer"
    assert dotun["is_founding_mentor"] is False
    assert dotun["paths"][:3] == ["full-stack-development", "frontend-development", "backend-engineering"]
    assert {"javascript", "typescript", "react", "sql"} <= set(dotun["paths"])
    assert dotun["mentorship_price_label"] == "₦250,000 ($200)"
    assert dotun["mentorship_duration_label"] == "2 months"


async def test_existing_founder_row_is_repositioned_once_and_edits_are_kept():
    async with AsyncSessionLocal() as db:
        await seed_mentors(db)
        founder = (await db.execute(select(Mentor).where(Mentor.contact_email == FOUNDING_MENTOR["contact_email"]))).scalar_one()
        # Simulate the previously deployed profile.
        founder.headline = "Cloud Security Mentor | Cloud Engineer"
        founder.bio = "I mentor people breaking into cloud security and cloud engineering, older copy."
        founder.paths = ["cloud-security", "cloud-engineering", "aws-security", "security-automation", "devsecops"]
        await db.commit()

        await seed_mentors(db)
        await db.refresh(founder)
        assert founder.headline == FOUNDING_MENTOR["headline"]
        assert founder.bio == FOUNDING_MENTOR["bio"]
        assert founder.paths == FOUNDING_MENTOR["paths"]

        # A later real edit from the mentor dashboard survives another seed run.
        founder.headline = "My own headline"
        await db.commit()
        await seed_mentors(db)
        await db.refresh(founder)
        assert founder.headline == "My own headline"

    assert FULLSTACK_MENTOR["paths"][0] == "full-stack-development"


async def test_the_earlier_mobile_profile_becomes_full_stack_and_loses_the_founding_label_once():
    async with AsyncSessionLocal() as db:
        await seed_mentors(db)
        row = (await db.execute(select(Mentor).where(Mentor.avatar_seed == FULLSTACK_MENTOR["avatar_seed"]))).scalar_one()
        row.display_name, row.headline = "David Oladotun Egundey", "Mobile Engineer"
        row.paths, row.is_founding_mentor = ["mobile-engineering", "mobile-development"], True
        await db.commit()

        await seed_mentors(db)
        await db.refresh(row)
        assert (row.display_name, row.headline) == ("David Oladotun Egundeyi", "Full-Stack Engineer")
        assert row.is_founding_mentor is False
        assert row.paths == FULLSTACK_MENTOR["paths"]

        # A later dashboard edit, and a deliberately re-set founding flag, survive another deploy.
        row.headline, row.is_founding_mentor = "Senior Full-Stack Engineer", True
        await db.commit()
        await seed_mentors(db)
        await db.refresh(row)
        assert row.headline == "Senior Full-Stack Engineer" and row.is_founding_mentor is True
