import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import get_llm_client
from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Project
from app.models.user import User


async def generate_portfolio_item(db: AsyncSession, user: User, project_id: uuid.UUID, submission_text: str) -> PortfolioItem:
    project = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if project is None:
        raise ValueError("Project not found.")

    # A portfolio entry is presented as the user's own finished work, so it
    # must not be generatable for a project they haven't actually completed
    # (this would otherwise let a user showcase work they never did).
    progress = (
        await db.execute(
            select(UserProgress).where(UserProgress.user_id == user.id, UserProgress.project_id == project_id)
        )
    ).scalar_one_or_none()
    if progress is None or progress.status != ProgressStatus.completed:
        raise PermissionError("Mark this project complete before adding it to your portfolio.")

    llm = get_llm_client()
    context = {"teaches": project.teaches, "skills_demonstrated": []}
    copy = await llm.generate_portfolio_copy(project.title, context, submission_text or project.expected_output)

    existing = await db.execute(
        select(PortfolioItem).where(PortfolioItem.user_id == user.id, PortfolioItem.project_id == project_id)
    )
    item = existing.scalar_one_or_none()
    if item is None:
        item = PortfolioItem(user_id=user.id, project_id=project_id, title=project.title)
        db.add(item)

    item.title = project.title
    item.project_description = copy.project_description
    item.readme_draft = copy.readme_draft
    item.cv_bullet = copy.cv_bullet
    item.linkedin_blurb = copy.linkedin_blurb
    item.case_study_md = copy.case_study_md
    item.skills_demonstrated = copy.skills_demonstrated
    if project.lab:
        # A Project Lab project carries its own authored skills and CV line,
        # which are more specific than anything generated from the title.
        item.skills_demonstrated = list(project.lab.get("skills", []))
        if project.lab.get("cv_bullet"):
            item.cv_bullet = project.lab["cv_bullet"]

    await db.commit()
    await db.refresh(item)
    return item


async def list_portfolio(db: AsyncSession, user_id: uuid.UUID) -> list[PortfolioItem]:
    result = await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == user_id).order_by(PortfolioItem.created_at.desc()))
    return list(result.scalars().all())


async def update_portfolio_item(db: AsyncSession, user_id: uuid.UUID, item_id: uuid.UUID, updates: dict) -> PortfolioItem:
    result = await db.execute(select(PortfolioItem).where(PortfolioItem.id == item_id, PortfolioItem.user_id == user_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise ValueError("Portfolio item not found.")
    for field, value in updates.items():
        if value is not None:
            setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


async def badges_for(db: AsyncSession, user_id: uuid.UUID, items: list[PortfolioItem]) -> dict:
    """item id -> {"badge", "verified_by"} for Project Lab pieces. The badge is
    "Repository checked" or, only after a reviewer approved it, the Verified one."""
    from app.services import lab_service
    from app.services.public_profile_service import _public_badge

    ids = [i.project_id for i in items]
    if not ids:
        return {}
    projects = {p.id: p for p in (await db.execute(select(Project).where(Project.id.in_(ids)))).scalars().all() if p.lab}
    states = await lab_service._states_for_user(db, user_id, list(projects.values())) if projects else {}
    out = {}
    for i in items:
        st = states.get(i.project_id)
        if st:
            ver = st["verification"]
            out[i.id] = {"badge": _public_badge(ver), "verified_by": ver["reviewer_name"] if ver["tier"] == "verified" else ""}
    return out
