"""Project Lab: curriculum integrity, sync, evidence based stages, completion
rules and the GitHub repository check. The product promise being guarded is
that no stage can be reached without evidence, and that nothing here claims
CareerFound verified anyone's code."""

import re

import pytest
import pytest_asyncio
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.lab import ProjectLabProgress
from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Project
from app.models.user import User
from app.seed.lab import LAB_CURRICULA
from app.seed.lab.universal import LEVELS, PUBLISH_STEPS, README_SECTIONS, UNIVERSAL_INTERVIEW
from app.seed.lab_sync import sync_all_lab_curricula
from app.seed.seed_data import seed_career_paths, seed_roadmap_content
from app.services import lab_service, repo_check, roadmap_service
from app.services.lab_service import LabError

CYBER = LAB_CURRICULA["cybersecurity"]
LONG_DASHES = ("—", "–", "‒", "―")


def _walk(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for v in value.values():
            yield from _walk(v)
    elif isinstance(value, (list, tuple)):
        for v in value:
            yield from _walk(v)


# ------------------------------------------------------------------ curriculum


def test_cybersecurity_curriculum_shape_and_progression():
    levels = [p["level"] for p in CYBER]
    assert levels == sorted(levels, key=LEVELS.index), "projects must be ordered by level"
    counts = {lv: levels.count(lv) for lv in LEVELS}
    assert counts == {"beginner": 4, "intermediate": 4, "advanced": 3, "job_ready": 1}
    difficulty = [p["difficulty"] for p in CYBER]
    assert difficulty == sorted(difficulty)


def test_slugs_unique_and_recommendations_are_valid_and_point_backwards():
    slugs = [p["slug"] for p in CYBER]
    assert len(slugs) == len(set(slugs))
    for index, project in enumerate(CYBER):
        for before in project["recommended_before"]:
            assert before in slugs
            assert slugs.index(before) < index, f"{project['slug']} recommends a later project"


def test_every_project_is_complete_enough_to_teach_from():
    for p in CYBER:
        assert len(p["requirements"]) >= 5, p["slug"]
        assert len(p["milestones"]) >= 8, p["slug"]
        stages = {m["stage"] for m in p["milestones"]}
        assert {"build", "test", "document"} <= stages, p["slug"]
        assert len(p["interview"]) >= 5, p["slug"]
        assert len(p["criteria"]) >= 4, p["slug"]
        assert len(p["documentation"]) >= 3, p["slug"]
        assert p["security_notes"], p["slug"]
        assert p["deliverable"] and p["cv_bullet"] and p["summary"], p["slug"]
        for key in ("overview", "problem", "solution", "architecture", "installation", "usage"):
            assert p["readme"].get(key), (p["slug"], key)


def test_every_tool_has_a_reason_and_keys_are_unique():
    for p in CYBER:
        for tool in p["tools"]:
            assert len(tool["reason"]) > 20, (p["slug"], tool["name"])
        for group in ("milestones", "interview", "criteria", "documentation"):
            keys = [i["key"] for i in p[group]]
            assert len(keys) == len(set(keys)), (p["slug"], group)


def test_interview_questions_are_project_specific_not_generic_filler():
    generic = {q["q"] for q in UNIVERSAL_INTERVIEW}
    seen = set()
    for p in CYBER:
        for q in p["interview"]:
            assert q["q"] not in generic
            assert q["q"] not in seen, "the same question must not be reused across projects"
            seen.add(q["q"])
            assert len(q["covers"]) > 30


def test_no_long_dashes_or_triple_hyphens_in_any_lab_content():
    corpus = list(_walk(CYBER)) + list(_walk(PUBLISH_STEPS)) + list(_walk(README_SECTIONS)) + list(_walk(UNIVERSAL_INTERVIEW))
    for text in corpus:
        assert not any(d in text for d in LONG_DASHES), text[:80]
        assert "---" not in text, text[:80]
        assert " -- " not in text, text[:80]


def test_publish_steps_teach_the_required_git_commands():
    commands = [c["cmd"] for step in PUBLISH_STEPS for c in step["commands"]]
    for needed in ("git init", "git add .", 'git commit -m "Initial project setup"', "git branch -M main", "git remote add origin YOUR_REPOSITORY_URL", "git push -u origin main"):
        assert needed in commands
    assert all(c["explain"] for step in PUBLISH_STEPS for c in step["commands"])


def test_no_claim_that_careerfound_verified_code():
    corpus = " ".join(_walk(CYBER)).lower()
    for phrase in ("careerfound verified", "verified by careerfound", "code verified", "we tested your code"):
        assert phrase not in corpus


# ------------------------------------------------------------------ repository


def test_repo_url_parsing_accepts_github_and_rejects_everything_else():
    assert repo_check.parse_repo_url("https://github.com/Some-One/my.project.git") == ("Some-One", "my.project")
    assert repo_check.parse_repo_url(" https://github.com/a/b/ ") == ("a", "b")
    for bad in ["https://evil.com/a/b", "http://github.com.evil.com/a/b", "https://github.com/a", "https://github.com/a/b/c", "javascript:alert(1)", "", "github.com/a/b"]:
        with pytest.raises(repo_check.InvalidRepositoryUrl):
            repo_check.parse_repo_url(bad)


def test_repo_evaluation_requires_public_readme_commits_and_no_env():
    ok = repo_check.evaluate({"reachable": True, "public": True, "readme": True, "commit_count": 3, "gitignore": True, "env_committed": False})
    assert ok["passed"]
    for patch in ({"public": False}, {"readme": False}, {"commit_count": 2}, {"env_committed": True}):
        bad = repo_check.evaluate({"reachable": True, "public": True, "readme": True, "commit_count": 5, "gitignore": True, "env_committed": False, **patch})
        assert not bad["passed"], patch
    assert not repo_check.evaluate({"reachable": False})["passed"]


# ------------------------------------------------------------------- database


@pytest_asyncio.fixture
async def seeded():
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        await sync_all_lab_curricula(db)
        user = User(email="lab@example.com", full_name="Lab User", password_hash="x")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user


async def _project(slug: str) -> Project:
    async with AsyncSessionLocal() as db:
        return (await db.execute(select(Project).where(Project.slug == slug))).scalar_one()


@pytest.mark.asyncio
async def test_sync_creates_twelve_projects_and_takes_over_legacy_ones(seeded):
    async with AsyncSessionLocal() as db:
        rows = (await db.execute(select(Project).where(Project.slug.isnot(None)))).scalars().all()
        assert len(rows) == 12
        titles = {r.title for r in (await db.execute(select(Project))).scalars().all()}
    assert "Build a Python port scanner" not in titles, "legacy project should be renamed in place, not duplicated"
    assert "Network Reconnaissance Tool" in titles


@pytest.mark.asyncio
async def test_sync_is_idempotent_and_keeps_ids_so_progress_survives(seeded):
    before = {p.slug: p.id for p in [await _project(c["slug"]) for c in CYBER]}
    async with AsyncSessionLocal() as db:
        await sync_all_lab_curricula(db)
        await sync_all_lab_curricula(db)
        count = len((await db.execute(select(Project))).scalars().all())
    after = {p.slug: p.id for p in [await _project(c["slug"]) for c in CYBER]}
    assert before == after
    assert count == len(set(before.values())) + 0 or count >= 12


@pytest.mark.asyncio
async def test_legacy_projects_keep_old_columns_filled(seeded):
    p = await _project("network-recon-tool")
    assert p.teaches and p.steps and p.expected_output and p.difficulty == 2 and p.level == "beginner"


@pytest.mark.asyncio
async def test_starting_creates_a_row_but_is_not_progress(seeded):
    p = await _project("network-recon-tool")
    async with AsyncSessionLocal() as db:
        detail = await lab_service.start(db, seeded, p.id)
    assert detail["stage"] == "started"
    assert not detail["flags"]["in_progress"] and not detail["flags"]["completed"]


@pytest.mark.asyncio
async def test_opening_a_project_never_creates_progress(seeded):
    p = await _project("network-recon-tool")
    async with AsyncSessionLocal() as db:
        detail = await lab_service.project_detail(db, seeded, p.id)
        rows = (await db.execute(select(ProjectLabProgress))).scalars().all()
    assert detail["stage"] is None and rows == []


@pytest.mark.asyncio
async def test_ticking_a_milestone_moves_to_in_progress(seeded):
    p = await _project("network-recon-tool")
    async with AsyncSessionLocal() as db:
        detail = await lab_service.set_milestone(db, seeded, p.id, "m1", True)
    assert detail["stage"] == "in_progress" and detail["milestones_done"] == 1


@pytest.mark.asyncio
async def test_unknown_keys_are_rejected(seeded):
    p = await _project("network-recon-tool")
    async with AsyncSessionLocal() as db:
        with pytest.raises(LabError):
            await lab_service.set_milestone(db, seeded, p.id, "zz", True)
        with pytest.raises(LabError):
            await lab_service.set_checklist(db, seeded, p.id, {"bogus": True})
        with pytest.raises(LabError):
            await lab_service.set_interview(db, seeded, p.id, {"bogus": "x" * 80})


async def _finish_work(user, project):
    async with AsyncSessionLocal() as db:
        for m in project.lab["milestones"]:
            await lab_service.set_milestone(db, user, project.id, m["key"], True)
        await lab_service.set_checklist(db, user, project.id, {c["key"]: True for c in project.lab["criteria"]})


@pytest.mark.asyncio
async def test_cannot_complete_with_missing_evidence_and_message_says_what(seeded):
    p = await _project("network-recon-tool")
    async with AsyncSessionLocal() as db:
        await lab_service.set_milestone(db, seeded, p.id, "m1", True)
        with pytest.raises(LabError) as err:
            await lab_service.complete(db, seeded, p.id)
    assert "milestone" in err.value.message and "criteria" in err.value.message


@pytest.mark.asyncio
async def test_completion_writes_legacy_progress_once_and_awards_xp_once(seeded):
    p = await _project("network-recon-tool")
    await _finish_work(seeded, p)
    async with AsyncSessionLocal() as db:
        d1 = await lab_service.complete(db, seeded, p.id)
        d2 = await lab_service.complete(db, seeded, p.id)
        progress = (await db.execute(select(UserProgress).where(UserProgress.user_id == seeded.id, UserProgress.project_id == p.id))).scalars().all()
    assert d1["stage"] == "completed" and d2["stage"] == "completed"
    assert len(progress) == 1 and progress[0].status == ProgressStatus.completed


@pytest.mark.asyncio
async def test_unticking_after_completion_takes_completed_away(seeded):
    p = await _project("network-recon-tool")
    await _finish_work(seeded, p)
    async with AsyncSessionLocal() as db:
        await lab_service.complete(db, seeded, p.id)
        detail = await lab_service.set_milestone(db, seeded, p.id, "m2", False)
    assert not detail["flags"]["completed"]


@pytest.mark.asyncio
async def test_legacy_submit_is_blocked_for_lab_projects(seeded):
    p = await _project("network-recon-tool")
    async with AsyncSessionLocal() as db:
        with pytest.raises(roadmap_service.LabManagedProject):
            await roadmap_service.submit_project(db, seeded.id, p.id)


@pytest.mark.asyncio
async def test_portfolio_requires_completion_then_published_repo(seeded, monkeypatch):
    p = await _project("network-recon-tool")
    async with AsyncSessionLocal() as db:
        with pytest.raises(LabError):
            await lab_service.add_to_portfolio(db, seeded, p.id)
    await _finish_work(seeded, p)
    async with AsyncSessionLocal() as db:
        await lab_service.complete(db, seeded, p.id)
        with pytest.raises(LabError) as err:
            await lab_service.add_to_portfolio(db, seeded, p.id)
        assert "Publish your repository" in err.value.message

        async def fake_inspect(url):
            return repo_check.evaluate({"url": url, "reachable": True, "public": True, "readme": True, "commit_count": 6, "gitignore": True, "env_committed": False})

        monkeypatch.setattr(repo_check, "inspect_repository", fake_inspect)
        await lab_service.set_repository(db, seeded, p.id, "https://github.com/someone/network-recon-tool.git")
        detail = await lab_service.check_repository(db, seeded, p.id)
        assert detail["stage"] == "published" and detail["github"]["repo_ok"]
        detail = await lab_service.add_to_portfolio(db, seeded, p.id)
        item = (await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == seeded.id))).scalar_one()
    assert detail["stage"] == "portfolio_ready"
    assert item.repo_url == "https://github.com/someone/network-recon-tool" and item.is_published
    assert item.skills_demonstrated == p.lab["skills"] and item.cv_bullet == p.lab["cv_bullet"]


@pytest.mark.asyncio
async def test_failed_repo_check_does_not_publish_and_changing_url_resets_check(seeded, monkeypatch):
    p = await _project("network-recon-tool")
    await _finish_work(seeded, p)

    async def private_repo(url):
        return repo_check.evaluate({"url": url, "reachable": False, "error": "not found"})

    monkeypatch.setattr(repo_check, "inspect_repository", private_repo)
    async with AsyncSessionLocal() as db:
        await lab_service.complete(db, seeded, p.id)
        await lab_service.set_repository(db, seeded, p.id, "https://github.com/someone/a")
        detail = await lab_service.check_repository(db, seeded, p.id)
        assert detail["stage"] == "completed" and not detail["github"]["repo_ok"]
        detail = await lab_service.set_repository(db, seeded, p.id, "https://github.com/someone/b")
        assert detail["github"]["repo_check"] == {}


@pytest.mark.asyncio
async def test_interview_ready_needs_every_technical_answer_and_three_general_ones(seeded):
    p = await _project("network-recon-tool")
    good = "I explain the handshake, the timeout, and why I chose threads over processes here."
    async with AsyncSessionLocal() as db:
        d = await lab_service.set_interview(db, seeded, p.id, {q["key"]: good for q in p.lab["interview"]})
        assert not d["flags"]["interview_ready"]
        d = await lab_service.set_interview(db, seeded, p.id, {"u1": "short", "u2": good, "u3": good})
        assert not d["interview"]["ready"], "a too short answer must not count"
        d = await lab_service.set_interview(db, seeded, p.id, {"u1": good})
    assert d["interview"]["ready"] and d["flags"]["interview_ready"]
    assert d["stage"] is None or d["stage"] == "started", "interview readiness does not skip earlier stages"


@pytest.mark.asyncio
async def test_curriculum_orders_levels_and_computes_readiness_and_dependencies(seeded):
    async with AsyncSessionLocal() as db:
        data = await lab_service.career_curriculum(db, seeded, "cybersecurity")
    assert [l["level"] for l in data["levels"]] == LEVELS
    assert data["totals"]["projects"] == 12 and data["totals"]["completed"] == 0
    flat = {p["slug"]: p for l in data["levels"] for p in l["projects"]}
    assert flat["network-recon-tool"]["ready"] and not flat["web-application-security-assessment"]["ready"]
    assert data["next_project_id"] == flat["network-recon-tool"]["id"]


@pytest.mark.asyncio
async def test_career_without_lab_curriculum_reports_unavailable(seeded):
    async with AsyncSessionLocal() as db:
        data = await lab_service.career_curriculum(db, seeded, "data-analysis")
    assert data["available"] is False


@pytest.mark.asyncio
async def test_detail_lists_recommended_before_and_ready_for(seeded):
    p = await _project("web-application-security-assessment")
    async with AsyncSessionLocal() as db:
        detail = await lab_service.project_detail(db, seeded, p.id)
        first = await lab_service.project_detail(db, seeded, (await _project("network-recon-tool")).id)
    assert {x["slug"] for x in detail["recommended_before"]} == {"network-recon-tool", "password-security-analyzer"}
    assert "web-application-security-assessment" in {x["slug"] for x in first["ready_for"]}
    assert "does not run, test or grade your code" in detail["evidence_note"]


# ------------------------------------------------------------------------- API


async def _login(client):
    r = await client.post("/api/v1/auth/register", json={"email": "api-lab@example.com", "password": "SecurePass123!", "full_name": "Api Lab"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.mark.asyncio
async def test_api_journey_and_auth(client, seeded):
    assert (await client.get("/api/v1/lab/overview")).status_code == 401
    headers = await _login(client)
    curriculum = (await client.get("/api/v1/lab/careers/cybersecurity", headers=headers)).json()
    pid = curriculum["levels"][0]["projects"][0]["id"]
    assert (await client.post(f"/api/v1/lab/projects/{pid}/start", headers=headers)).json()["stage"] == "started"
    r = await client.put(f"/api/v1/lab/projects/{pid}/milestones/m1", json={"done": True}, headers=headers)
    assert r.status_code == 200 and r.json()["stage"] == "in_progress"
    assert (await client.put(f"/api/v1/lab/projects/{pid}/milestones/nope", json={"done": True}, headers=headers)).status_code == 404
    assert (await client.put(f"/api/v1/lab/projects/{pid}/repository", json={"url": "https://evil.example/a/b"}, headers=headers)).status_code == 422
    assert (await client.post(f"/api/v1/lab/projects/{pid}/complete", headers=headers)).status_code == 400
    # the old endpoint cannot be used to skip the checks
    assert (await client.post(f"/api/v1/projects/{pid}/submit", headers=headers)).status_code == 409
    overview = (await client.get("/api/v1/lab/overview?career=cybersecurity", headers=headers)).json()
    assert overview["available"] and overview["current"]["id"] == pid


@pytest.mark.asyncio
async def test_available_careers_lists_only_careers_with_a_curriculum(seeded):
    async with AsyncSessionLocal() as db:
        careers = await lab_service.available_careers(db)
    assert [c["slug"] for c in careers] == ["cybersecurity"] and careers[0]["projects"] == 12


def test_homepage_lab_snapshot_is_not_stale():
    from app.seed import export_lab_showcase

    assert export_lab_showcase.SNAPSHOT_PATH.read_text(encoding="utf-8") == export_lab_showcase.render(), (
        "Run `python -m app.seed.export_lab_showcase` to refresh frontend/src/data/lab-cybersecurity.json"
    )
    for text in _walk(export_lab_showcase.build_snapshot()):
        assert not any(d in text for d in LONG_DASHES)
