from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.assessment import AssessmentOut, AssessmentSubmitRequest
from app.services import assessment_service

router = APIRouter(prefix="/assessment", tags=["assessment"])


@router.post("", response_model=AssessmentOut, status_code=status.HTTP_201_CREATED)
async def submit_assessment(
    payload: AssessmentSubmitRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    limiter.check(f"assessment:{user.id}", settings.AI_RATE_LIMIT_PER_MINUTE)
    assessment = await assessment_service.submit_assessment(db, user.id, payload)
    return AssessmentOut(
        id=assessment.id,
        created_at=assessment.created_at,
        career_dna=assessment.career_dna,
        recommendations=assessment.recommendations,
    )


@router.get("/latest", response_model=AssessmentOut)
async def latest_assessment(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    assessment = await assessment_service.get_latest_assessment(db, user.id)
    if assessment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No assessment yet. Take the 'Find Your Tech Path' assessment first.")
    return AssessmentOut(
        id=assessment.id,
        created_at=assessment.created_at,
        career_dna=assessment.career_dna,
        recommendations=assessment.recommendations,
    )
