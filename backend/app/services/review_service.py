"""Human review of Project Lab work.

A project is only marked Verified when a real reviewer, a mentor or an admin
on CareerFound, read the submission, opened the repository and signed an
approval with their own name. The reviewer must say they opened the
repository, must write a note, and can never review their own work. Every
decision is written to the audit log.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lab import ProjectLabProgress
from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Project
from app.models.user import Role, User
from app.services import audit_service
from app.services.lab_service import LabError, derive

MIN_NOTE = 20
MAX_NOTE = 2000


def can_review(user: User) -> bool:
    return user.role in {Role.mentor, Role.admin}


def _short(name: str) -> str:
    parts = (name or "").split()
    if not parts:
        return "A learner"
    return parts[0] + (f" {parts[-1][0]}." if len(parts) > 1 else "")


async def _state(db: AsyncSession, progress: ProjectLabProgress, project: Project) -> dict:
    item = (await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == progress.user_id, PortfolioItem.project_id == project.id))).scalar_one_or_none()
    legacy = (
        await db.execute(select(UserProgress).where(UserProgress.user_id == progress.user_id, UserProgress.project_id == project.id))
    ).scalar_one_or_none()
    return derive(project, progress, item, bool(legacy and legacy.status == ProgressStatus.completed))


async def queue(db: AsyncSession, reviewer: User) -> list[dict]:
    rows = (
        await db.execute(
            select(ProjectLabProgress, Project, User)
            .join(Project, Project.id == ProjectLabProgress.project_id)
            .join(User, User.id == ProjectLabProgress.user_id)
            .where(ProjectLabProgress.review_status == "pending", ProjectLabProgress.user_id != reviewer.id)
            .order_by(ProjectLabProgress.submitted_at)
        )
    ).all()
    out = []
    for progress, project, learner in rows:
        state = await _state(db, progress, project)
        ver = state["verification"]
        if ver["tier"] != "in_review":
            continue  # the repository changed or the work was un-completed since it was submitted
        out.append(
            {
                "id": progress.id,
                "project_title": project.title,
                "level": project.level,
                "kind": project.kind,
                "learner": _short(learner.full_name),
                "repo_url": progress.submitted_repo_url,
                "note": progress.submitted_note,
                "submitted_at": progress.submitted_at.isoformat() if progress.submitted_at else None,
                "automated_checks": ver["automated_checks"],
                "requirements": [r if isinstance(r, str) else r.get("text", "") for r in project.lab.get("requirements", [])][:12],
                "criteria": [c["text"] for c in project.lab.get("criteria", [])],
            }
        )
    return out


async def decide(db: AsyncSession, reviewer: User, progress_id: uuid.UUID, decision: str, note: str, opened_repository: bool) -> dict:
    if not can_review(reviewer):
        raise LabError("Only mentors and admins can review projects.", 403)
    if decision not in {"approve", "request_changes"}:
        raise LabError("Decision must be approve or request_changes.", 422)
    note = (note or "").strip()
    if len(note) < MIN_NOTE:
        raise LabError(f"Write a review note of at least {MIN_NOTE} characters, so the learner knows what you saw.", 422)
    progress = (await db.execute(select(ProjectLabProgress).where(ProjectLabProgress.id == progress_id))).scalar_one_or_none()
    if progress is None or progress.review_status != "pending":
        raise LabError("This submission is not waiting for review.", 404)
    if progress.user_id == reviewer.id:
        raise LabError("You cannot review your own project.", 403)
    project = (await db.execute(select(Project).where(Project.id == progress.project_id))).scalar_one()
    state = await _state(db, progress, project)
    if state["verification"]["tier"] != "in_review":
        raise LabError("The repository or the project changed after it was submitted. Ask the learner to submit it again.", 409)
    if decision == "approve" and not opened_repository:
        raise LabError("Confirm that you opened the repository before approving.", 422)

    progress.review_status = "approved" if decision == "approve" else "changes_requested"
    progress.reviewer_id = reviewer.id
    progress.reviewer_name = reviewer.full_name
    progress.reviewed_at = datetime.now(timezone.utc)
    progress.review_note = note[:MAX_NOTE]
    await db.commit()
    await audit_service.log_action(
        db,
        user_id=reviewer.id,
        action=f"project_review.{decision}",
        resource_type="project_lab_progress",
        resource_id=str(progress.id),
    )
    return {"id": progress.id, "review_status": progress.review_status}
