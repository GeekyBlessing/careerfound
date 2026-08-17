import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.community import Community, CommunityPost
from app.models.user import User


async def get_community_by_path(db: AsyncSession, path_slug: str) -> Community | None:
    path = (await db.execute(select(CareerPath).where(CareerPath.slug == path_slug))).scalar_one_or_none()
    if path is None:
        return None
    result = await db.execute(select(Community).where(Community.path_id == path.id))
    return result.scalar_one_or_none()


async def list_posts(db: AsyncSession, community_id: uuid.UUID) -> list[tuple[CommunityPost, str]]:
    result = await db.execute(
        select(CommunityPost, User.full_name)
        .join(User, User.id == CommunityPost.user_id)
        .where(CommunityPost.community_id == community_id)
        .order_by(CommunityPost.created_at.desc())
    )
    return [(post, name) for post, name in result.all()]


async def create_post(db: AsyncSession, community_id: uuid.UUID, user_id: uuid.UUID, kind: str, title: str, body: str) -> CommunityPost:
    post = CommunityPost(community_id=community_id, user_id=user_id, kind=kind, title=title, body=body)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post
