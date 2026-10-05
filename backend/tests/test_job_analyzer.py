"""Job Description Analyzer: skills are read from the pasted text, proof comes
only from finished work, self-reported skills never count, and the 'ready'
verdict is narrow."""

import pytest
import pytest_asyncio
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.career_profile import UserSkill
from app.models.roadmap import Project
from app.models.user import User
from app.seed.lab_sync import sync_all_lab_curricula
from app.seed.seed_data import seed_career_paths, seed_roadmap_content
from app.services import job_analyzer_service as jas
from app.services import lab_service, repo_check, roadmap_service
from app.services.career_profile_service import ProfileError

LONG_DASHES = ("—", "–", "‒", "―")

POSTING = """Junior Security Analyst

About you:
You can read network traffic and you know your way around Linux. Python scripting is required.

Requirements:
- Experience with Wireshark or other packet analysis tools
- Working knowledge of Linux and networking (TCP/IP, DNS)
- Python for automation

Nice to have:
- Splunk or another SIEM
- Kubernetes
"""


def test_extraction_reads_terms_whole_word_and_splits_required_from_preferred():
    reqs = {r["term"]: r for r in jas.extract_requirements(POSTING, "Junior Security Analyst")}
    assert reqs["Python"]["level"] == "required"
    assert reqs["Linux"]["level"] == "required" and reqs["Linux"]["mentions"] == 2
    assert reqs["Wireshark"]["level"] == "required"
    assert reqs["SIEM"]["level"] == "preferred" and reqs["Kubernetes"]["level"] == "preferred"
    assert "Java" not in reqs, "java must not match inside javascript"
    assert "Java" not in {r["term"] for r in jas.extract_requirements("We use JavaScript and the rest of the stack.")}
    assert "REST APIs" not in {r["term"] for r in jas.extract_requirements("You will join the rest of the team.")}


def test_seniority_and_years_are_flagged_honestly():
    keys = {f["key"] for f in jas.role_flags("Requires 5+ years of experience.", "Senior Backend Engineer")}
    assert keys == {"senior", "years"}
    assert jas.role_flags("1-2 years preferred", "Junior Analyst") == []


@pytest_asyncio.fixture
async def world():
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        await sync_all_lab_curricula(db)
        user = User(email="jd@example.com", full_name="Jd User", password_hash="x")
        db.add(user)
        await db.commit()
        await db.refresh(user)
        await roadmap_service.generate_roadmap(db, user.id, "cybersecurity")
    return user


async def _run(user, text=POSTING, title="Junior Security Analyst"):
    async with AsyncSessionLocal() as db:
        return await jas.create(db, user, title, "Acme", "", text)


@pytest.mark.asyncio
async def test_a_beginner_with_no_work_is_told_to_strengthen_with_concrete_steps(world):
    r = (await _run(world))["result"]
    assert r["verdict"] == "strengthen" and r["match_pct"] == 0
    assert r["strong_matches"] == []
    assert any("not completed a project" in x for x in r["reasons"])
    assert r["before_applying"] and all(b["href"].startswith("/") for b in r["before_applying"])


@pytest.mark.asyncio
async def test_listing_a_skill_yourself_does_not_count_but_is_shown(world):
    async with AsyncSessionLocal() as db:
        db.add(UserSkill(user_id=world.id, name="Python", name_key="python", level="strong"))
        await db.commit()
    r = (await _run(world))["result"]
    assert r["match_pct"] == 0
    assert "Python" in r["listed_not_proven"]


@pytest.mark.asyncio
async def test_finished_project_work_turns_matching_skills_into_strong_matches(world, monkeypatch):
    async with AsyncSessionLocal() as db:
        p = (await db.execute(select(Project).where(Project.slug == "network-recon-tool"))).scalar_one()

        async def fake(url):
            return repo_check.evaluate({"url": url, "reachable": True, "public": True, "readme": True, "commit_count": 6, "gitignore": True, "env_committed": False})

        monkeypatch.setattr(repo_check, "inspect_repository", fake)
        for m in p.lab["milestones"]:
            await lab_service.set_milestone(db, world, p.id, m["key"], True)
        await lab_service.set_checklist(db, world, p.id, {c["key"]: True for c in p.lab["criteria"]})
        await lab_service.complete(db, world, p.id)
    r = (await _run(world))["result"]
    strong = {s["skill"] for s in r["strong_matches"]}
    assert "Python" in strong
    assert all(s["evidence"] for s in r["strong_matches"])
    assert r["match_pct"] > 0
    assert r["gaps"], "Kubernetes and others must still show as gaps"
    assert "Kubernetes" in {g["skill"] for g in r["gaps"]}


@pytest.mark.asyncio
async def test_senior_role_is_never_ready_to_apply(world):
    r = (await _run(world, "Requirements:\nRequires 8+ years of hands-on experience.\n- Python scripting and Linux administration\n- Wireshark, Splunk and Networking depth", "Senior Security Engineer"))["result"]
    assert r["verdict"] != "ready"
    assert {f["key"] for f in r["flags"]} == {"senior", "years"}


@pytest.mark.asyncio
async def test_text_with_no_recognisable_skills_gives_no_percentage(world):
    r = await _run(world, "We are a friendly team who value kindness, curiosity, and long walks on the beach. Come and join us today for a great time.", "Role")
    assert r["result"]["verdict"] == "unclear" and r["match_pct"] is None


@pytest.mark.asyncio
async def test_validation_and_privacy(world):
    async with AsyncSessionLocal() as db:
        with pytest.raises(ProfileError):
            await jas.create(db, world, "x", "", "", "too short")
        with pytest.raises(ProfileError):
            await jas.create(db, world, "x", "", "javascript:alert(1)", POSTING)
    saved = await _run(world)
    async with AsyncSessionLocal() as db:
        other = User(email="other@example.com", full_name="Other", password_hash="x")
        db.add(other)
        await db.commit()
        await db.refresh(other)
        with pytest.raises(ProfileError):
            await jas.get(db, other, saved["id"])
        assert (await jas.list_all(db, other)) == []
        again = await jas.refresh(db, world, saved["id"])
        assert again["id"] == saved["id"]


@pytest.mark.asyncio
async def test_copy_has_no_long_dashes(world):
    blob = repr(await _run(world))
    assert not any(d in blob for d in LONG_DASHES)


@pytest.mark.asyncio
async def test_api_roundtrip_requires_auth(client):
    assert (await client.post("/api/v1/career/job-analyses", json={"description": POSTING})).status_code == 401
    reg = await client.post("/api/v1/auth/register", json={"email": "jda@example.com", "password": "SecurePass123!", "full_name": "J A"})
    h = {"Authorization": f"Bearer {reg.json()['access_token']}"}
    res = await client.post("/api/v1/career/job-analyses", json={"title": "Analyst", "description": POSTING}, headers=h)
    assert res.status_code == 201 and res.json()["result"]["recognised"] >= 4
    assert len((await client.get("/api/v1/career/job-analyses", headers=h)).json()) == 1
    assert (await client.delete(f"/api/v1/career/job-analyses/{res.json()['id']}", headers=h)).status_code == 204
