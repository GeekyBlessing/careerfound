"""Unauthenticated, read-only endpoints. Only data a person chose to publish
is returned, and an unpublished profile answers exactly like a missing one."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limit import limiter
from app.db.session import get_db
from app.services import public_profile_service
from app.services.career_profile_service import ProfileError

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/profiles/{username}")
async def public_profile(username: str, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"public_profile:{request.client.host if request.client else 'unknown'}", 120)
    if len(username) > 30:
        raise HTTPException(404, "Profile not found.")
    try:
        return await public_profile_service.public_view(db, username)
    except ProfileError as exc:
        raise HTTPException(exc.status, exc.message) from exc
