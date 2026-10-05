"""Project verification: evidence-checked and verified are different claims.
Verified needs a real reviewer who opened the repository, cannot be the
learner, and stops applying the moment the repository link changes."""

import pytest
import pytest_asyncio
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.audit import AuditLog
from app.models.lab import ProjectLabProgress
from app.models.roadmap import Project
from app.models.user import Role, User
from app.seed.lab_sync import sync_all_lab_curricula
from app.seed.seed_data import seed_career_paths, seed_roadmap_content
from app.services import lab_service, repo_check, review_service
from app.services.lab_service import LabError
from app.services.verification import BADGE_TITLE, CHECKED_TITLE

LONG_DASHES = ("—", "–", "‒", "―")


@pytest_asyncio.fixture
async def world(monkeypatch):
    async def fake(url):
        return repo_check.evaluate({"url": url, "reachable": True, "public": True, "readme": True, "commit_count": 6, "gitignore": True, "env_committed": False, "tests": True})

    monkeypatch.setattr(repo_check, "inspect_repository", fake)
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        await sync_all_lab_curricula(db)
        learner = User(email="learner@example.com", full_name="Ada Lovelace", password_hash="x")
        mentor = User(email="mentor@example.com", full_name="Grace Hopper", password_hash="x", role=Role.mentor)
        plain = User(email="plain@example.com", full_name="Plain User", password_hash="x")
        db.add_all([learner, mentor, plain])
        await db.commit()
        for u in (learner, mentor, plain):
            await db.refresh(u)
        project = (await db.execute(select(Project).where(Project.slug == "network-recon-tool"))).scalar_one()
    return learner, mentor, plain, project


async def _publish(user, project, repo="https://github.com/ada/network-recon-tool"):
    async with AsyncSessionLocal() as db:
        for m in project.lab["milestones"]:
            await lab_service.set_milestone(db, user, project.id, m["key"], True)
        await lab_service.set_checklist(db, user, project.id, {c["key"]: True for c in project.lab["criteria"]})
        await lab_service.complete(db, user, project.id)
        await lab_service.set_repository(db, user, project.id, repo)
        return await lab_service.check_repository(db, user, project.id)


@pytest.mark.asyncio
async def test_unfinished_work_has_no_badge_and_cannot_be_submitted(world):
    learner, _, _, project = world
    async with AsyncSessionLocal() as db:
        detail = await lab_service.start(db, learner, project.id)
        assert detail["verification"]["tier"] == "none" and detail["verification"]["badge"] is None
        with pytest.raises(LabError) as err:
            await lab_service.submit_for_review(db, learner, project.id, "please")
    assert "Complete the project" in err.value.message


@pytest.mark.asyncio
async def test_a_passing_repository_check_is_evidence_checked_never_verified(world):
    learner, _, _, project = world
    detail = await _publish(learner, project)
    v = detail["verification"]
    assert v["tier"] == "evidence_checked" and v["badge"]["title"] == CHECKED_TITLE
    assert v["badge"]["title"] != BADGE_TITLE
    assert "has not been reviewed by a person" in v["copy"]
    assert v["automated_checks"]["tests"] is True and v["can_submit"]


@pytest.mark.asyncio
async def test_submitting_queues_it_but_does_not_verify(world):
    learner, _, _, project = world
    await _publish(learner, project)
    async with AsyncSessionLocal() as db:
        detail = await lab_service.submit_for_review(db, learner, project.id, "Please check the scanner.")
        with pytest.raises(LabError):
            await lab_service.submit_for_review(db, learner, project.id, "again")
    assert detail["verification"]["tier"] == "in_review" and detail["verification"]["badge"] is None


@pytest.mark.asyncio
async def test_only_mentors_and_admins_review_and_never_their_own_work(world):
    learner, mentor, plain, project = world
    await _publish(learner, project)
    async with AsyncSessionLocal() as db:
        await lab_service.submit_for_review(db, learner, project.id, "")
        pid = (await db.execute(select(ProjectLabProgress.id))).scalar_one()
        with pytest.raises(LabError) as err:
            await review_service.decide(db, plain, pid, "approve", "Looks good to me, nicely done.", True)
        assert err.value.status == 403
        with pytest.raises(LabError) as own:
            learner.role = Role.mentor
            await review_service.decide(db, learner, pid, "approve", "Looks good to me, nicely done.", True)
        assert "own project" in own.value.message
        learner.role = Role.user
        assert await review_service.queue(db, learner) == []
        queue = await review_service.queue(db, mentor)
    assert len(queue) == 1 and queue[0]["learner"] == "Ada L." and "email" not in repr(queue[0])


@pytest.mark.asyncio
async def test_approval_needs_a_note_and_confirmation_then_verifies_and_is_audited(world):
    learner, mentor, _, project = world
    await _publish(learner, project)
    async with AsyncSessionLocal() as db:
        await lab_service.submit_for_review(db, learner, project.id, "")
        pid = (await db.execute(select(ProjectLabProgress.id))).scalar_one()
        with pytest.raises(LabError):
            await review_service.decide(db, mentor, pid, "approve", "short", True)
        with pytest.raises(LabError) as nope:
            await review_service.decide(db, mentor, pid, "approve", "A clear and well tested scanner with good docs.", False)
        assert "opened the repository" in nope.value.message
        await review_service.decide(db, mentor, pid, "approve", "A clear and well tested scanner with good docs.", True)
        detail = await lab_service.project_detail(db, learner, project.id)
        logs = (await db.execute(select(AuditLog).where(AuditLog.action == "project_review.approve"))).scalars().all()
    v = detail["verification"]
    assert v["tier"] == "verified" and v["badge"]["title"] == BADGE_TITLE
    assert v["reviewer_name"] == "Grace Hopper" and "well tested" in v["review_note"]
    assert len(logs) == 1 and logs[0].user_id == mentor.id


@pytest.mark.asyncio
async def test_changes_requested_lets_the_learner_resubmit(world):
    learner, mentor, _, project = world
    await _publish(learner, project)
    async with AsyncSessionLocal() as db:
        await lab_service.submit_for_review(db, learner, project.id, "")
        pid = (await db.execute(select(ProjectLabProgress.id))).scalar_one()
        await review_service.decide(db, mentor, pid, "request_changes", "The README has no install steps and there are no tests.", False)
        d = await lab_service.project_detail(db, learner, project.id)
        assert d["verification"]["tier"] == "changes_requested" and d["verification"]["can_submit"]
        d = await lab_service.submit_for_review(db, learner, project.id, "Added install steps and tests.")
    assert d["verification"]["tier"] == "in_review"


@pytest.mark.asyncio
async def test_changing_the_repository_link_removes_the_verification(world):
    learner, mentor, _, project = world
    await _publish(learner, project)
    async with AsyncSessionLocal() as db:
        await lab_service.submit_for_review(db, learner, project.id, "")
        pid = (await db.execute(select(ProjectLabProgress.id))).scalar_one()
        await review_service.decide(db, mentor, pid, "approve", "A clear and well tested scanner with good docs.", True)
        await lab_service.set_repository(db, learner, project.id, "https://github.com/ada/a-different-repo")
        d = await lab_service.project_detail(db, learner, project.id)
    assert d["verification"]["tier"] == "none" and d["verification"]["badge"] is None
    assert d["verification"]["reviewer_name"] == ""


@pytest.mark.asyncio
async def test_unticking_after_approval_removes_the_badge(world):
    learner, mentor, _, project = world
    await _publish(learner, project)
    async with AsyncSessionLocal() as db:
        await lab_service.submit_for_review(db, learner, project.id, "")
        pid = (await db.execute(select(ProjectLabProgress.id))).scalar_one()
        await review_service.decide(db, mentor, pid, "approve", "A clear and well tested scanner with good docs.", True)
        d = await lab_service.set_milestone(db, learner, project.id, project.lab["milestones"][0]["key"], False)
    assert d["verification"]["tier"] == "none"


def test_copy_has_no_long_dashes_and_no_code_grading_claims():
    from app.services import verification

    blob = " ".join(verification.TIER_COPY.values()) + verification.BADGE_TITLE + verification.CHECKED_TITLE
    assert not any(d in blob for d in LONG_DASHES)
    for phrase in ("tested your code", "graded", "certified"):
        assert phrase not in blob.lower()


@pytest.mark.asyncio
async def test_review_endpoints_are_closed_to_ordinary_users(client):
    reg = await client.post("/api/v1/auth/register", json={"email": "r@example.com", "password": "SecurePass123!", "full_name": "R U"})
    h = {"Authorization": f"Bearer {reg.json()['access_token']}"}
    assert (await client.get("/api/v1/review/queue", headers=h)).status_code == 403
