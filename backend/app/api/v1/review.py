import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.lab import ReviewDecision
from app.services import review_service
from app.services.lab_service import LabError

router = APIRouter(prefix="/review", tags=["project-review"])


def _require_reviewer(user: User = Depends(get_current_user)) -> User:
    if not review_service.can_review(user):
        raise HTTPException(403, "Only mentors and admins can review projects.")
    return user


@router.get("/queue")
async def queue(user: User = Depends(_require_reviewer), db: AsyncSession = Depends(get_db)):
    return await review_service.queue(db, user)


@router.post("/{progress_id}/decision")
async def decide(progress_id: uuid.UUID, payload: ReviewDecision, user: User = Depends(_require_reviewer), db: AsyncSession = Depends(get_db)):
    try:
        return await review_service.decide(db, user, progress_id, payload.decision, payload.note, payload.opened_repository)
    except LabError as exc:
        raise HTTPException(exc.status, exc.message) from exc
