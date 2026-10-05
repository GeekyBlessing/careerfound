"""Career Readiness Score: every point must trace back to something the
person did, self-reported claims must not move it, and the empty state must
say so instead of showing a made up number."""

import pytest
import pytest_asyncio
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.career_profile import UserCertification, UserSkill
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Lesson, Project
from app.models.user import User
from app.seed.lab_sync import sync_all_lab_curricula
from app.seed.seed_data import seed_career_paths, seed_roadmap_content
from app.services import career_readiness_service as crs
from app.services import lab_service, repo_check, roadmap_service

LONG_DASHES = ("—", "–", "‒", "―")


@pytest_asyncio.fixture
async def world():
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        await sync_all_lab_curricula(db)
        user = User(email="ready@example.com", full_name="Ready User", password_hash="x")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


async def _score(user):
    async with AsyncSessionLocal() as db:
        return await crs.compute(db, user)


async def _join(user, slug):
    async with AsyncSessionLocal() as db:
        await roadmap_service.generate_roadmap(db, user.id, slug)


def _by_key(result):
    return {s["key"]: s for s in result["signals"]}


def test_weights_total_one_hundred():
    assert sum(w for _, _, w in crs.SIGNALS) == 100


@pytest.mark.asyncio
async def test_no_roadmap_gives_an_honest_empty_state(world):
    r = await _score(world)
    assert not r["has_path"] and not r["has_activity"]
    assert r["band"] == "No score yet" and r["signals"] == []
    assert r["next_action"]["href"] == "/onboarding"


@pytest.mark.asyncio
async def test_new_roadmap_has_no_activity_and_points_to_the_first_lesson(world):
    await _join(world, "cybersecurity")
    r = await _score(world)
    assert r["has_path"] and not r["has_activity"] and r["score"] == 0
    assert r["band"] == "No score yet"
    assert r["biggest_opportunity"]["signal"] == "learning"
    assert r["next_action"]["href"] == "/roadmap"
    assert all(s["available"] for s in r["signals"])
    assert sum(s["weight"] for s in r["signals"]) == pytest.approx(100, abs=0.2)


@pytest.mark.asyncio
async def test_finishing_a_lesson_moves_learning_and_skills_only(world):
    await _join(world, "cybersecurity")
    async with AsyncSessionLocal() as db:
        lesson = (await db.execute(select(Lesson).where(Lesson.skill_node_id.isnot(None)).order_by(Lesson.order_index))).scalars().first()
        await roadmap_service.complete_lesson(db, world.id, lesson.id)
    r = await _score(world)
    sig = _by_key(r)
    assert r["has_activity"] and r["score"] >= 1
    assert sig["learning"]["pct"] > 0 and sig["skills"]["pct"] > 0
    for key in ("projects", "documentation", "proof", "portfolio", "interview"):
        assert sig[key]["pct"] == 0, key


@pytest.mark.asyncio
async def test_self_reported_skills_and_certifications_never_move_the_score(world):
    await _join(world, "cybersecurity")
    before = await _score(world)
    async with AsyncSessionLocal() as db:
        db.add_all(
            [
                UserSkill(user_id=world.id, name="Python", name_key="python", level="strong"),
                UserSkill(user_id=world.id, name="Nmap", name_key="nmap", level="strong"),
                UserCertification(user_id=world.id, name="Security+", issuer="CompTIA", status="earned", year=2025),
            ]
        )
        await db.commit()
    after = await _score(world)
    assert after["score"] == before["score"]
    assert [s["points"] for s in after["signals"]] == [s["points"] for s in before["signals"]]
    assert "self-reported" in after["not_counted"]


@pytest.mark.asyncio
async def test_project_documentation_proof_and_portfolio_follow_evidence(world, monkeypatch):
    await _join(world, "cybersecurity")
    async with AsyncSessionLocal() as db:
        p = (await db.execute(select(Project).where(Project.slug == "network-recon-tool"))).scalar_one()

        async def fake_inspect(url):
            return repo_check.evaluate({"url": url, "reachable": True, "public": True, "readme": True, "commit_count": 6, "gitignore": True, "env_committed": False})

        monkeypatch.setattr(repo_check, "inspect_repository", fake_inspect)
        for m in p.lab["milestones"]:
            await lab_service.set_milestone(db, world, p.id, m["key"], True)
        await lab_service.set_checklist(db, world, p.id, {c["key"]: True for c in p.lab["criteria"]})

        mid = _by_key(await crs.compute(db, world))
        assert mid["projects"]["pct"] == 0, "ticked milestones alone are not a completed project"

        await lab_service.complete(db, world, p.id)
        r = _by_key(await crs.compute(db, world))
        assert r["projects"]["pct"] == 25 and r["documentation"]["pct"] == 0 and r["proof"]["pct"] == 0

        await lab_service.set_repository(db, world, p.id, "https://github.com/someone/network-recon-tool")
        await lab_service.check_repository(db, world, p.id)
        r = _by_key(await crs.compute(db, world))
        assert r["documentation"]["pct"] == 33 and r["proof"]["pct"] == 17 and r["portfolio"]["pct"] == 0

        await lab_service.add_to_portfolio(db, world, p.id)
        r = _by_key(await crs.compute(db, world))
        assert r["portfolio"]["pct"] == 33


@pytest.mark.asyncio
async def test_career_without_a_lab_leaves_repo_signals_out_and_rescales(world):
    await _join(world, "software-engineering")
    r = await _score(world)
    sig = _by_key(r)
    assert not sig["documentation"]["available"] and not sig["proof"]["available"]
    assert sig["documentation"]["pct"] is None and sig["documentation"]["weight"] == 0
    assert sum(s["weight"] for s in r["signals"]) == pytest.approx(100, abs=0.3)
    assert not r["has_lab"]
    # Unavailable signals never become the recommendation.
    assert r["biggest_opportunity"]["signal"] not in {"documentation", "proof"}


@pytest.mark.asyncio
async def test_every_action_points_at_a_real_route(world):
    await _join(world, "cybersecurity")
    r = await _score(world)
    allowed = ("/roadmap", "/projects", "/portfolio", "/skill-gap", "/mentor", "/onboarding", "/job-matcher", "/profile")
    for s in r["signals"]:
        if s["action"]:
            assert s["action"]["href"].startswith(allowed), s["action"]


@pytest.mark.asyncio
async def test_copy_has_no_long_dashes(world):
    await _join(world, "cybersecurity")
    r = await _score(world)
    blob = repr(r)
    assert not any(d in blob for d in LONG_DASHES)


@pytest.mark.asyncio
async def test_endpoint_requires_auth_and_returns_the_score(client):
    assert (await client.get("/api/v1/career/readiness")).status_code == 401
    reg = await client.post("/api/v1/auth/register", json={"email": "api@example.com", "password": "SecurePass123!", "full_name": "Api User"})
    token = reg.json()["access_token"]
    res = await client.get("/api/v1/career/readiness", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200 and res.json()["has_path"] is False
