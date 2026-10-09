"""Public portfolio and project to portfolio: private by default, nothing
invented, every claim labelled with how it is known, and no personal data
leaking."""

import pytest
import pytest_asyncio
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.career_profile import UserSkill
from app.models.lab import ProjectLabProgress
from app.models.portfolio import PortfolioItem
from app.models.roadmap import Project
from app.models.user import Role, User
from app.seed.lab_sync import sync_all_lab_curricula
from app.seed.seed_data import seed_career_paths, seed_roadmap_content
from app.services import case_study_service as css
from app.services import lab_service, public_profile_service as pps
from app.services import repo_check, review_service, roadmap_service
from app.services.career_profile_service import ProfileError, add_certification
from app.services.verification import BADGE_TITLE

LONG_DASHES = ("—", "–", "‒", "―")


@pytest_asyncio.fixture
async def world(monkeypatch):
    async def fake(url):
        return repo_check.evaluate({"url": url, "reachable": True, "public": True, "readme": True, "commit_count": 6, "gitignore": True, "env_committed": False})

    monkeypatch.setattr(repo_check, "inspect_repository", fake)
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        await sync_all_lab_curricula(db)
        learner = User(email="secret.person@example.com", full_name="Ada Lovelace", password_hash="x")
        mentor = User(email="m@example.com", full_name="Grace Hopper", password_hash="x", role=Role.mentor)
        db.add_all([learner, mentor])
        await db.commit()
        await db.refresh(learner)
        await db.refresh(mentor)
        await roadmap_service.generate_roadmap(db, learner.id, "cybersecurity")
        project = (await db.execute(select(Project).where(Project.slug == "network-recon-tool"))).scalar_one()
    return learner, mentor, project


async def _to_portfolio(user, project, answer=None):
    async with AsyncSessionLocal() as db:
        for m in project.lab["milestones"]:
            await lab_service.set_milestone(db, user, project.id, m["key"], True)
        await lab_service.set_checklist(db, user, project.id, {c["key"]: True for c in project.lab["criteria"]})
        await lab_service.complete(db, user, project.id)
        if answer:
            await lab_service.set_interview(db, user, project.id, {"u4": answer})
        await lab_service.set_repository(db, user, project.id, "https://github.com/ada/network-recon-tool")
        await lab_service.check_repository(db, user, project.id)
        await lab_service.add_to_portfolio(db, user, project.id)
        return (await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == user.id))).scalar_one()


# ------------------------------------------------------------------ case study


@pytest.mark.asyncio
async def test_adding_to_portfolio_creates_an_honest_editable_draft(world):
    learner, _, project = world
    item = await _to_portfolio(learner, project)
    async with AsyncSessionLocal() as db:
        v = case_study_service_view = css.view((await db.execute(select(PortfolioItem).where(PortfolioItem.id == item.id))).scalar_one())
    cs = v["case_study"]
    assert cs["overview"] and cs["problem"] and cs["solution"] and cs["architecture"]
    assert cs["technologies"] and v["github"] == "https://github.com/ada/network-recon-tool"
    assert cs["results"] == "" and cs["screenshots"] == [], "outcomes are never invented"
    assert set(v["needs_input"]) == {"challenges", "results", "screenshots"}
    assert v["publishable"] and v["status"] == "draft"


@pytest.mark.asyncio
async def test_challenges_come_from_the_learners_own_answer_only(world):
    learner, _, project = world
    mine = "The hardest part was timeouts: scanning closed ports hung until I added a short socket timeout and a thread pool."
    item = await _to_portfolio(learner, project, mine)
    async with AsyncSessionLocal() as db:
        row = (await db.execute(select(PortfolioItem).where(PortfolioItem.id == item.id))).scalar_one()
        v = css.view(row)
    assert v["case_study"]["challenges"] == mine
    assert "challenges" not in v["needs_input"]


@pytest.mark.asyncio
async def test_edits_survive_regeneration_unless_overwrite_is_asked_for(world):
    learner, _, project = world
    item = await _to_portfolio(learner, project)
    async with AsyncSessionLocal() as db:
        await css.update(db, learner.id, item.id, {"results": "Scanned 1,000 ports in 9 seconds.", "live_demo": "https://example.com/demo", "screenshots": ["https://example.com/a.png"]})
        kept = await css.generate(db, learner.id, item.id)
        assert kept["case_study"]["results"] == "Scanned 1,000 ports in 9 seconds."
        assert kept["live_demo"] == "https://example.com/demo" and kept["case_study"]["screenshots"] == ["https://example.com/a.png"]
        reset = await css.generate(db, learner.id, item.id, overwrite=True)
    assert reset["case_study"]["results"] == ""


@pytest.mark.asyncio
async def test_case_study_validation_and_ownership(world):
    learner, mentor, project = world
    item = await _to_portfolio(learner, project)
    async with AsyncSessionLocal() as db:
        with pytest.raises(ProfileError):
            await css.update(db, learner.id, item.id, {"screenshots": ["javascript:alert(1)"]})
        with pytest.raises(ProfileError):
            await css.update(db, learner.id, item.id, {"live_demo": "ftp://nope"})
        with pytest.raises(ProfileError):
            await css.update(db, learner.id, item.id, {"overview": "x" * 5000})
        with pytest.raises(ProfileError) as err:
            await css.update(db, mentor.id, item.id, {"overview": "not mine"})
        assert err.value.status == 404


# ------------------------------------------------------------- public profile


@pytest.mark.asyncio
async def test_a_profile_is_private_until_switched_on_and_off_looks_like_missing(world):
    learner, _, _ = world
    async with AsyncSessionLocal() as db:
        mine = await pps.get_mine(db, learner)
        assert mine["exists"] is False and mine["suggested_username"] == "ada-lovelace"
        await pps.save_mine(db, learner, {"username": "ada-lovelace", "headline": "Aspiring security analyst"})
        with pytest.raises(ProfileError) as off:
            await pps.public_view(db, "ada-lovelace")
        with pytest.raises(ProfileError) as none:
            await pps.public_view(db, "nobody-here")
        assert off.value.status == none.value.status == 404 and off.value.message == none.value.message
        await pps.save_mine(db, learner, {"is_public": True})
        view = await pps.public_view(db, "ADA-Lovelace")
    assert view["name"] == "Ada Lovelace" and view["headline"] == "Aspiring security analyst"


@pytest.mark.asyncio
async def test_username_rules(world):
    learner, mentor, _ = world
    async with AsyncSessionLocal() as db:
        for bad in ("ab", "-ada", "ada-", "has space", "UPPER_case", "a--b", "admin", "careerfound", "x" * 31, "u"):
            with pytest.raises(ProfileError):
                await pps.save_mine(db, learner, {"username": bad})
        await pps.save_mine(db, learner, {"username": "ada-l"})
        with pytest.raises(ProfileError) as taken:
            await pps.save_mine(db, mentor, {"username": "ADA-L"})
        assert taken.value.status == 409
        with pytest.raises(ProfileError):
            await pps.save_mine(db, learner, {"github_url": "http://insecure.example"})
        with pytest.raises(ProfileError):
            await pps.save_mine(db, learner, {"linkedin_url": "javascript:alert(1)"})


@pytest.mark.asyncio
async def test_public_page_shows_only_what_is_published_and_labels_every_claim(world):
    learner, mentor, project = world
    item = await _to_portfolio(learner, project)
    async with AsyncSessionLocal() as db:
        db.add(UserSkill(user_id=learner.id, name="Kubernetes", name_key="kubernetes", level="strong"))
        await db.commit()
        await add_certification(db, learner.id, "Security+", "CompTIA", "earned", 2025, "https://example.com/c")
        await pps.save_mine(db, learner, {"username": "ada", "is_public": True, "github_url": "https://github.com/ada"})
        view = await pps.public_view(db, "ada")
        # An unpublished piece must not appear.
        row = (await db.execute(select(PortfolioItem).where(PortfolioItem.id == item.id))).scalar_one()
        row.is_published = False
        await db.commit()
        hidden = await pps.public_view(db, "ada")
    assert [p["title"] for p in view["projects"]] == ["Network Reconnaissance Tool"]
    assert view["projects"][0]["badge"]["title"] == "Repository checked", "never Verified without a reviewer"
    assert view["skills"]["self_reported"] == ["Kubernetes"]
    assert "Kubernetes" not in [s["label"] for s in view["skills"]["with_evidence"]]
    assert view["certifications"][0]["name"] == "Security+"
    assert "self-reported" in view["labels"]["note"].lower()
    assert hidden["projects"] == []


@pytest.mark.asyncio
async def test_verified_badge_appears_only_after_a_reviewer_approves(world):
    learner, mentor, project = world
    await _to_portfolio(learner, project)
    async with AsyncSessionLocal() as db:
        await pps.save_mine(db, learner, {"username": "ada", "is_public": True})
        await lab_service.submit_for_review(db, learner, project.id, "")
        before = await pps.public_view(db, "ada")
        pid = (await db.execute(select(ProjectLabProgress.id))).scalar_one()
        await review_service.decide(db, mentor, pid, "approve", "Solid scanner with clear docs and tests.", True)
        after = await pps.public_view(db, "ada")
        cv = await pps.cv_markdown(db, learner)
    assert before["projects"][0]["badge"]["tier"] == "evidence_checked"
    assert after["projects"][0]["badge"]["title"] == BADGE_TITLE and after["projects"][0]["verified_by"] == "Grace Hopper"
    assert BADGE_TITLE in cv


@pytest.mark.asyncio
async def test_hidden_sections_are_not_returned_and_no_personal_data_leaks(world):
    learner, _, project = world
    await _to_portfolio(learner, project)
    async with AsyncSessionLocal() as db:
        await pps.save_mine(db, learner, {"username": "ada", "is_public": True, "show_readiness": False, "show_skills": False, "show_certifications": False})
        view = await pps.public_view(db, "ada")
    assert view["readiness"] is None and view["skills"] is None and view["certifications"] is None
    blob = repr(view)
    assert "secret.person@example.com" not in blob and str(learner.id) not in blob
    assert not any(d in blob for d in LONG_DASHES)


@pytest.mark.asyncio
async def test_readiness_is_shown_only_when_there_is_real_activity(world):
    learner, _, _ = world
    async with AsyncSessionLocal() as db:
        await pps.save_mine(db, learner, {"username": "ada", "is_public": True})
        view = await pps.public_view(db, "ada")
    assert view["readiness"] is None, "a zero score is not worth publishing"


@pytest.mark.asyncio
async def test_cv_export_is_plain_and_does_not_mark_unreviewed_work(world):
    learner, _, project = world
    await _to_portfolio(learner, project)
    async with AsyncSessionLocal() as db:
        cv = await pps.cv_markdown(db, learner)
    assert cv.startswith("# Ada Lovelace") and "Network Reconnaissance Tool" in cv
    assert BADGE_TITLE not in cv
    assert not any(d in cv for d in LONG_DASHES)


@pytest.mark.asyncio
async def test_api_public_endpoint_needs_no_login_and_hides_private_profiles(client):
    reg = await client.post("/api/v1/auth/register", json={"email": "pub@example.com", "password": "SecurePass123!", "full_name": "Pub Lic"})
    h = {"Authorization": f"Bearer {reg.json()['access_token']}"}
    assert (await client.get("/api/v1/public/profiles/pub-lic")).status_code == 404
    saved = await client.put("/api/v1/career/profile", json={"username": "pub-lic", "headline": "Hello"}, headers=h)
    assert saved.status_code == 200 and saved.json()["is_public"] is False
    assert (await client.get("/api/v1/public/profiles/pub-lic")).status_code == 404
    await client.put("/api/v1/career/profile", json={"is_public": True}, headers=h)
    res = await client.get("/api/v1/public/profiles/pub-lic")
    assert res.status_code == 200 and res.json()["name"] == "Pub Lic"
    assert (await client.put("/api/v1/career/profile", json={"username": "admin"}, headers=h)).status_code == 422


@pytest.mark.asyncio
async def test_portfolio_list_carries_the_honest_badge(world):
    learner, mentor, project = world
    await _to_portfolio(learner, project)
    from app.services import portfolio_service

    async with AsyncSessionLocal() as db:
        items = await portfolio_service.list_portfolio(db, learner.id)
        before = await portfolio_service.badges_for(db, learner.id, items)
        await lab_service.submit_for_review(db, learner, project.id, "")
        pid = (await db.execute(select(ProjectLabProgress.id))).scalar_one()
        await review_service.decide(db, mentor, pid, "approve", "Solid scanner with clear docs and tests.", True)
        after = await portfolio_service.badges_for(db, learner.id, items)
    assert before[items[0].id]["badge"]["title"] == "Repository checked"
    assert after[items[0].id]["badge"]["title"] == BADGE_TITLE and after[items[0].id]["verified_by"] == "Grace Hopper"
