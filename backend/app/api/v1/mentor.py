import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.mentor import (
    MentorChatMessageOut,
    MentorChatRequest,
    MentorChatResponse,
    ProjectReviewRequest,
    ProjectReviewResponse,
)
from app.services import mentor_service

router = APIRouter(prefix="/mentor", tags=["mentor"])


@router.post("/chat", response_model=MentorChatResponse)
async def mentor_chat(
    payload: MentorChatRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    limiter.check(f"mentor_chat:{user.id}", settings.AI_RATE_LIMIT_PER_MINUTE)
    convo, reply, follow_ups, history = await mentor_service.send_message(db, user, payload.conversation_id, payload.message)
    return MentorChatResponse(
        conversation_id=convo.id,
        reply=reply,
        follow_up_questions=follow_ups,
        history=[MentorChatMessageOut(role=m.role, content=m.content, created_at=m.created_at) for m in history],
    )


@router.post("/projects/{project_id}/review", response_model=ProjectReviewResponse)
async def review_project(
    project_id: uuid.UUID,
    payload: ProjectReviewRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    limiter.check(f"project_review:{user.id}", settings.AI_RATE_LIMIT_PER_MINUTE)
    try:
        review = await mentor_service.review_project(db, user, project_id, payload.submission_text)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return ProjectReviewResponse(
        overall_assessment=review.overall_assessment,
        findings=[{"severity": f.severity, "comment": f.comment} for f in review.findings],
        skills_demonstrated=review.skills_demonstrated,
        suggested_next_project=review.suggested_next_project,
    )
