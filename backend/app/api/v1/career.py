"""CareerFound 2.0 endpoints that connect the journey: readiness, skill gap,
job analysis, public profile. Grouped under /career so the learning, lab and
portfolio routers they read from stay unchanged."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services import career_readiness_service

router = APIRouter(prefix="/career", tags=["career"])


@router.get("/readiness")
async def readiness(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await career_readiness_service.compute(db, user)
