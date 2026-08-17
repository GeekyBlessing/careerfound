import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import get_llm_client
from app.models.portfolio import PortfolioItem
from app.models.roadmap import Project
from app.models.user import User


async def generate_portfolio_item(db: AsyncSession, user: User, project_id: uuid.UUID, submission_text: str) -> PortfolioItem:
    project = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if project is None:
        raise ValueError("Project not found.")

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
