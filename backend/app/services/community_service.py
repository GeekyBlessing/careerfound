import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.career import CareerPath
from app.models.community import Community, CommunityPost
from app.models.user import User
from app.services.career_taxonomy import canonical_slug


async def get_community_by_path(db: AsyncSession, path_slug: str) -> Community | None:
    path = (await db.execute(select(CareerPath).where(CareerPath.slug == canonical_slug(path_slug)))).scalar_one_or_none()
    if path is None:
        return None
    result = await db.execute(select(Community).where(Community.path_id == path.id))
    return result.scalar_one_or_none()


SAMPLE_ACCOUNT_SUFFIX = "@careerfound.dev"


def public_name(full_name: str) -> str:
    """First name and last initial, so a public list never shows someone's full name."""
    parts = full_name.split()
    if len(parts) < 2:
        return parts[0] if parts else "Member"
    return f"{parts[0]} {parts[-1][0]}."


async def list_posts(db: AsyncSession, community_id: uuid.UUID) -> list[tuple[CommunityPost, str]]:
    query = (
        select(CommunityPost, User.full_name)
        .join(User, User.id == CommunityPost.user_id)
        .where(CommunityPost.community_id == community_id)
        .order_by(CommunityPost.created_at.desc())
    )
    if settings.ENVIRONMENT == "production":
        # Sample posts written by the seeded demo learner must never read as real members.
        query = query.where(~User.email.like(f"%{SAMPLE_ACCOUNT_SUFFIX}"))
    result = await db.execute(query)
    return [(post, name) for post, name in result.all()]


async def create_post(db: AsyncSession, community_id: uuid.UUID, user_id: uuid.UUID, kind: str, title: str, body: str) -> CommunityPost:
    post = CommunityPost(community_id=community_id, user_id=user_id, kind=kind, title=title, body=body)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post
