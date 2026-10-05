"""Skill Gap Analyzer: statuses come from finished lessons and projects only,
claims never change them, and every gap links to something the person can do."""

import pytest
import pytest_asyncio
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.career import CareerPath
from app.models.career_profile import UserSkill
from app.models.roadmap import Lesson
from app.models.user import User
from app.seed.lab_sync import sync_all_lab_curricula
from app.seed.seed_data import seed_career_paths, seed_roadmap_content
from app.services import roadmap_service, skill_gap_analyzer

LONG_DASHES = ("—", "–", "‒", "―")


@pytest_asyncio.fixture
async def world():
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        await sync_all_lab_curricula(db)
        user = User(email="gap@example.com", full_name="Gap User", password_hash="x")
        db.add(user)
        await db.commit()
        await db.refresh(user)
        await roadmap_service.generate_roadmap(db, user.id, "cybersecurity")
    return user


async def _analyse(user):
    async with AsyncSessionLocal() as db:
        path = (await db.execute(select(CareerPath).where(CareerPath.slug == "cybersecurity"))).scalar_one()
        return await skill_gap_analyzer.analyse(db, user, path)


def test_tokens_ignore_filler_and_stem():
    assert "netwo" in skill_gap_analyzer.tokens("Networking fundamentals (TCP/IP, DNS, HTTP)")
    assert "funda" not in skill_gap_analyzer.tokens("Networking fundamentals")
    assert skill_gap_analyzer.tokens("Network") & skill_gap_analyzer.tokens("Networking")


@pytest.mark.asyncio
async def test_new_learner_has_everything_missing_and_a_next_step_for_each(world):
    data = await _analyse(world)
    assert data["total"] == 9, "portfolio and job preparation are measured elsewhere"
    assert data["counts"] == {"strong": 0, "developing": 0, "missing": 9}
    assert all(s["next_step"] for s in data["skills"])
    assert len(data["focus"]) == 3 and data["focus"][0]["label"] == "Computer Fundamentals"


@pytest.mark.asyncio
async def test_finishing_a_lesson_makes_that_skill_developing_or_strong(world):
    async with AsyncSessionLocal() as db:
        lesson = (await db.execute(select(Lesson).where(Lesson.skill_node_id.isnot(None)).order_by(Lesson.order_index))).scalars().first()
        await roadmap_service.complete_lesson(db, world.id, lesson.id)
    data = await _analyse(world)
    touched = [s for s in data["skills"] if s["status"] != "missing"]
    assert len(touched) == 1
    assert touched[0]["status"] in {"developing", "strong"}
    assert data["counts"]["missing"] == 8


@pytest.mark.asyncio
async def test_listing_a_skill_yourself_does_not_change_any_status(world):
    before = await _analyse(world)
    async with AsyncSessionLocal() as db:
        db.add(UserSkill(user_id=world.id, name="Linux", name_key="linux", level="strong"))
        await db.commit()
    after = await _analyse(world)
    assert [s["status"] for s in after["skills"]] == [s["status"] for s in before["skills"]]
    linux = next(s for s in after["skills"] if s["key"] == "linux")
    assert linux["listed_by_you"] == "Linux" and linux["status"] == "missing"


@pytest.mark.asyncio
async def test_employer_expectations_are_tied_to_skills_or_reported_as_uncovered(world):
    data = await _analyse(world)
    tied = [r for s in data["skills"] for r in s["employer_expects"]]
    path_reqs = ["Networking fundamentals (TCP/IP, DNS, HTTP)", "Linux command line", "Recognizing common attack patterns", "Log analysis and pattern recognition", "Basic scripting for automation"]
    assert sorted(tied + data["uncovered_expectations"]) == sorted(path_reqs)
    linux = next(s for s in data["skills"] if s["key"] == "linux")
    assert "Linux command line" in linux["employer_expects"]


@pytest.mark.asyncio
async def test_no_long_dashes_in_analysis_copy(world):
    blob = repr(await _analyse(world))
    assert not any(d in blob for d in LONG_DASHES)


@pytest.mark.asyncio
async def test_api_skills_and_certifications_are_validated_and_private(client):
    reg = await client.post("/api/v1/auth/register", json={"email": "s1@example.com", "password": "SecurePass123!", "full_name": "S One"})
    h = {"Authorization": f"Bearer {reg.json()['access_token']}"}
    other = await client.post("/api/v1/auth/register", json={"email": "s2@example.com", "password": "SecurePass123!", "full_name": "S Two"})
    h2 = {"Authorization": f"Bearer {other.json()['access_token']}"}

    assert (await client.post("/api/v1/career/skills", json={"name": "x", "level": "strong"}, headers=h)).status_code == 422
    assert (await client.post("/api/v1/career/skills", json={"name": "Python", "level": "wizard"}, headers=h)).status_code == 422
    made = await client.post("/api/v1/career/skills", json={"name": "Python", "level": "comfortable"}, headers=h)
    assert made.status_code == 201 and made.json()["self_reported"] is True
    again = await client.post("/api/v1/career/skills", json={"name": "python", "level": "strong"}, headers=h)
    assert again.json()["id"] == made.json()["id"] and again.json()["level"] == "strong"
    assert len((await client.get("/api/v1/career/skills", headers=h)).json()) == 1
    assert (await client.get("/api/v1/career/skills", headers=h2)).json() == []
    assert (await client.delete(f"/api/v1/career/skills/{made.json()['id']}", headers=h2)).status_code == 404
    assert (await client.delete(f"/api/v1/career/skills/{made.json()['id']}", headers=h)).status_code == 204

    bad = await client.post("/api/v1/career/certifications", json={"name": "Security+", "credential_url": "javascript:alert(1)"}, headers=h)
    assert bad.status_code == 422
    ok = await client.post("/api/v1/career/certifications", json={"name": "Security+", "issuer": "CompTIA", "year": 2025, "credential_url": "https://example.com/c/1"}, headers=h)
    assert ok.status_code == 201 and ok.json()["self_reported"] is True
    assert (await client.get("/api/v1/career/skill-gap", headers=h)).json() == {"has_path": False}
