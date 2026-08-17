from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.progress import XPEvent
from app.models.user import User
from app.schemas.community import CommunityOut, CreatePostRequest, LeaderboardEntryOut, PostOut
from app.services import community_service

router = APIRouter(prefix="/communities", tags=["community"])


@router.get("/{path_slug}", response_model=CommunityOut)
async def get_community(path_slug: str, db: AsyncSession = Depends(get_db)):
    community = await community_service.get_community_by_path(db, path_slug)
    if community is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Community not found for this path")
    return CommunityOut(id=community.id, path_slug=path_slug, name=community.name, description=community.description)


@router.get("/{path_slug}/posts", response_model=list[PostOut])
async def list_posts(path_slug: str, db: AsyncSession = Depends(get_db)):
    community = await community_service.get_community_by_path(db, path_slug)
    if community is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Community not found for this path")
    posts = await community_service.list_posts(db, community.id)
    return [
        PostOut(id=p.id, author_name=name, kind=p.kind, title=p.title, body=p.body, upvotes=p.upvotes, created_at=p.created_at)
        for p, name in posts
    ]


@router.post("/{path_slug}/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    path_slug: str,
    payload: CreatePostRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    community = await community_service.get_community_by_path(db, path_slug)
    if community is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Community not found for this path")
    post = await community_service.create_post(db, community.id, user.id, payload.kind, payload.title, payload.body)
    return PostOut(id=post.id, author_name=user.full_name, kind=post.kind, title=post.title, body=post.body, upvotes=post.upvotes, created_at=post.created_at)


@router.get("/{path_slug}/leaderboard", response_model=list[LeaderboardEntryOut])
async def leaderboard(path_slug: str, db: AsyncSession = Depends(get_db)):
    """Simple all-time XP leaderboard across all users (community-scoped
    leaderboards activate once per-path XP attribution is added in Phase 2).
    """
    result = await db.execute(
        select(User.full_name, func.coalesce(func.sum(XPEvent.amount), 0).label("xp"))
        .outerjoin(XPEvent, XPEvent.user_id == User.id)
        .group_by(User.id)
        .order_by(func.coalesce(func.sum(XPEvent.amount), 0).desc())
        .limit(20)
    )
    rows = result.all()
    return [LeaderboardEntryOut(rank=i + 1, user_name=name, xp=xp) for i, (name, xp) in enumerate(rows)]
