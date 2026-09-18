import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_admin, require_mentor
from app.db.session import get_db
from app.models.marketplace import ApplicationStatus, Mentor, MentorNote, SessionStatus
from app.models.user import User
from app.schemas.marketplace import (
    AskQuestionRequest,
    BookSessionRequest,
    MentorApplicationIn,
    MentorApplicationOut,
    MentorApplicationReviewRequest,
    MentorEarningsSummaryOut,
    MentorMatchOut,
    MentorNoteIn,
    MentorNoteOut,
    MentorOut,
    MentorProfileUpdate,
    MentorRecommendationIn,
    MentorRecommendationOut,
    MentorRecommendationRequestOut,
    MentorReviewOut,
    MentorSessionDetailOut,
    MentorSessionOut,
    ReviewRequest,
    SessionStatusUpdate,
)
from app.services import marketplace_service, mentor_matching_service

router = APIRouter(tags=["marketplace"])


@router.get("/mentors", response_model=list[MentorOut])
async def list_mentors(path: str | None = None, min_rating: float | None = None, db: AsyncSession = Depends(get_db)):
    return await marketplace_service.list_mentors(db, path, min_rating)


@router.get("/mentors/recommended", response_model=MentorRecommendationRequestOut)
async def recommended_mentors(
    path: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """The 'smart mentorship' endpoint: reads the user's real skill-gap
    snapshot for this path and returns ranked mentors with a reason string
    generated from that data — not a generic directory listing."""
    result = await mentor_matching_service.recommend_mentors_for_user(db, user, path)
    return MentorRecommendationRequestOut(
        snapshot=result["snapshot"],
        matches=[MentorMatchOut(mentor=m["mentor"], score=m["score"], reason=m["reason"]) for m in result["matches"]],
    )


@router.get("/mentor-recommendations/mine", response_model=list[MentorRecommendationOut])
async def my_mentor_recommendations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Recommendations real mentors have made for this user after a session
    — feeds the 'Your mentor's recommendations' section on the roadmap page."""
    return await marketplace_service.list_recommendations_for_user(db, user.id)


@router.post("/mentors/claim", response_model=MentorOut)
async def claim_mentor(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Self-serve link between a real logged-in account and a Mentor row —
    used by the founding mentor (and, later, anyone whose mentor application
    was approved) instead of an admin-provisioned login."""
    mentor = await marketplace_service.claim_mentor(db, user)
    if mentor is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "No unclaimed mentor profile matches your account email. If you applied to become a mentor, "
            "wait for approval first.",
        )
    return mentor


@router.post("/mentor-applications", response_model=MentorApplicationOut, status_code=status.HTTP_201_CREATED)
async def apply_to_be_a_mentor(
    payload: MentorApplicationIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return await marketplace_service.submit_application(db, payload.model_dump())


@router.get("/mentors/{mentor_id}", response_model=MentorOut)
async def get_mentor(mentor_id: str, db: AsyncSession = Depends(get_db)):
    # mentor_id is a str, not uuid.UUID, here specifically so this route
    # accepts either a mentor's real UUID or their public slug (e.g.
    # "mobile-engineering-mentor") — marketplace_service.get_mentor resolves
    # whichever form was given. This is the one dynamic mentor-profile route
    # in the app; a slug is a value for its existing {mentor_id} segment,
    # not a second, conflicting route.
    mentor = await marketplace_service.get_mentor(db, mentor_id)
    if mentor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mentor not found")
    return mentor


@router.get("/mentors/{mentor_id}/reviews", response_model=list[MentorReviewOut])
async def list_mentor_reviews(mentor_id: str, db: AsyncSession = Depends(get_db)):
    # Resolve slug-or-uuid to the mentor's real id first, since
    # MentorReview rows are always keyed on the real UUID.
    mentor = await marketplace_service.get_mentor(db, mentor_id)
    if mentor is None:
        return []
    return await marketplace_service.list_reviews(db, mentor.id)


@router.post("/mentors/{mentor_id}/sessions", response_model=MentorSessionOut, status_code=status.HTTP_201_CREATED)
async def book_session(
    mentor_id: uuid.UUID,
    payload: BookSessionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    mentor = await marketplace_service.get_mentor(db, mentor_id)
    if mentor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mentor not found")
    message = payload.message or payload.note  # `note` kept as a deprecated alias, never silently dropped
    session = await marketplace_service.book_session(
        db, mentor, user, payload.scheduled_at, payload.duration_minutes, payload.help_topic, message
    )
    return session


@router.post("/mentors/{mentor_id}/questions", response_model=MentorSessionOut, status_code=status.HTTP_201_CREATED)
async def ask_question(
    mentor_id: uuid.UUID,
    payload: AskQuestionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lightweight 'Ask a Question' CTA — an async inbox item, not a
    scheduled session. Reuses MentorSession (duration_minutes=0 marks it as
    a question rather than a booked slot) instead of a whole new table."""
    mentor = await marketplace_service.get_mentor(db, mentor_id)
    if mentor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mentor not found")
    session = await marketplace_service.book_session(
        db, mentor, user, datetime.now(timezone.utc), 0, "other", payload.message
    )
    return session


@router.post("/mentors/{mentor_id}/sessions/{session_id}/review", response_model=MentorReviewOut, status_code=status.HTTP_201_CREATED)
async def review_session(
    mentor_id: uuid.UUID,
    session_id: uuid.UUID,
    payload: ReviewRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await marketplace_service.get_session(db, session_id)
    if session is None or session.mentor_id != mentor_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    if session.mentee_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only review your own sessions")
    if session.status != SessionStatus.completed:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can only review a session after it's completed")
    return await marketplace_service.submit_review(db, session, payload.rating, payload.comment)


@router.get("/sessions/mine", response_model=list[MentorSessionOut])
async def my_sessions(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await marketplace_service.list_my_sessions(db, user.id)


# --- Mentor dashboard (require_mentor: resolves + authorizes the caller's own Mentor row) ---


@router.get("/mentors/me/sessions", response_model=list[MentorSessionDetailOut])
async def my_mentor_sessions(mentor: Mentor = Depends(require_mentor), db: AsyncSession = Depends(get_db)):
    rows = await marketplace_service.list_mentor_sessions(db, mentor.id)
    return [
        MentorSessionDetailOut.model_validate(row["session"]).model_copy(
            update={"mentee_id": row["session"].mentee_id, "mentee_name": row["mentee_name"]}
        )
        for row in rows
    ]


@router.patch("/mentors/me/sessions/{session_id}/status", response_model=MentorSessionOut)
async def update_session_status(
    session_id: uuid.UUID, payload: SessionStatusUpdate, mentor: Mentor = Depends(require_mentor), db: AsyncSession = Depends(get_db)
):
    payload.validate_status()
    session = await marketplace_service.get_session(db, session_id)
    if session is None or session.mentor_id != mentor.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    session.status = SessionStatus(payload.status)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/mentors/me/profile", response_model=MentorOut)
async def my_mentor_profile(mentor: Mentor = Depends(require_mentor)):
    return mentor


@router.get("/mentors/me/summary", response_model=MentorEarningsSummaryOut)
async def my_mentor_summary(mentor: Mentor = Depends(require_mentor), db: AsyncSession = Depends(get_db)):
    summary = await marketplace_service.mentor_earnings_summary(db, mentor)
    return MentorEarningsSummaryOut(**summary)


@router.get("/mentors/me/sessions/{session_id}/notes", response_model=MentorNoteOut)
async def get_session_note(
    session_id: uuid.UUID, mentor: Mentor = Depends(require_mentor), db: AsyncSession = Depends(get_db)
):
    note = (
        await db.execute(select(MentorNote).where(MentorNote.session_id == session_id, MentorNote.mentor_id == mentor.id))
    ).scalar_one_or_none()
    if note is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No notes yet for this session")
    return note


@router.post("/mentors/me/sessions/{session_id}/notes", response_model=MentorNoteOut)
async def upsert_session_note(
    session_id: uuid.UUID,
    payload: MentorNoteIn,
    mentor: Mentor = Depends(require_mentor),
    db: AsyncSession = Depends(get_db),
):
    """Private: never exposed on any mentee-facing route."""
    session = await marketplace_service.get_session(db, session_id)
    if session is None or session.mentor_id != mentor.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return await marketplace_service.upsert_mentor_note(db, session_id, mentor.id, payload.model_dump())


@router.post(
    "/mentors/me/sessions/{session_id}/recommendations",
    response_model=MentorRecommendationOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_session_recommendation(
    session_id: uuid.UUID,
    payload: MentorRecommendationIn,
    mentor: Mentor = Depends(require_mentor),
    db: AsyncSession = Depends(get_db),
):
    """Mentee-visible (unlike notes above) — feeds 'Your mentor's
    recommendations' on the mentee's roadmap page."""
    session = await marketplace_service.get_session(db, session_id)
    if session is None or session.mentor_id != mentor.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    items = [item.model_dump() for item in payload.items]
    return await marketplace_service.create_recommendation(db, session, items)


@router.patch("/mentors/me/profile", response_model=MentorOut)
async def update_my_profile(
    payload: MentorProfileUpdate, mentor: Mentor = Depends(require_mentor), db: AsyncSession = Depends(get_db)
):
    updates = payload.model_dump(exclude_unset=True)
    return await marketplace_service.update_mentor_profile(db, mentor, updates)


# --- Admin: review "apply to become a mentor" submissions ------------------
# Kept here (not admin.py) so it stays next to the rest of the marketplace
# domain logic it operates on; still gated by require_admin like every other
# admin endpoint.


@router.get("/mentor-applications", response_model=list[MentorApplicationOut])
async def list_mentor_applications(
    status_filter: str | None = None, _admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    status_enum = ApplicationStatus(status_filter) if status_filter else None
    return await marketplace_service.list_applications(db, status_enum)


@router.post("/mentor-applications/{application_id}/approve", response_model=MentorOut)
async def approve_mentor_application(
    application_id: uuid.UUID,
    payload: MentorApplicationReviewRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    application = await marketplace_service.get_application(db, application_id)
    if application is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    return await marketplace_service.approve_application(db, application, payload.reviewer_note)


@router.post("/mentor-applications/{application_id}/reject", response_model=MentorApplicationOut)
async def reject_mentor_application(
    application_id: uuid.UUID,
    payload: MentorApplicationReviewRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    application = await marketplace_service.get_application(db, application_id)
    if application is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    return await marketplace_service.reject_application(db, application, payload.reviewer_note)
