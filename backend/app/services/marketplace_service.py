"""
Mentor marketplace: browsing, filtering, and booking are fully real and
backed by the database. Payment capture is an explicit integration point —
see `_charge_placeholder` below — because no Stripe (or other processor)
credentials are configured in this build. Sessions are created in
'requested' status and never silently marked paid. Sessions are free at
launch (founding-mentor cohort), so price_cents is 0 for every booking
today regardless of the payment hook.
"""
import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.marketplace import (
    ApplicationStatus,
    Mentor,
    MentorApplication,
    MentorNote,
    MentorRecommendation,
    MentorReview,
    MentorSession,
    SessionStatus,
)
from app.models.roadmap import Roadmap, RoadmapStatus
from app.models.user import Role, User
from app.services import skill_gap_service

_HELP_TOPIC_LABELS = {
    "choose_career": "figuring out which tech career to choose",
    "start_cybersecurity": "getting started in cybersecurity",
    "need_roadmap": "building a learning roadmap",
    "project_help": "getting help with a project",
    "portfolio_guidance": "portfolio guidance",
    "career_advice": "general career advice",
    "other": "something not listed above",
}

_PERSONA_LABELS = {
    "student": "A student",
    "graduate": "A recent graduate",
    "working": "Someone currently working in another field",
    "switcher": "A career switcher",
    "entrepreneur": "An aspiring entrepreneur",
    "other": "Someone",
}

_GOAL_LABELS = {
    "job": "land a job in tech",
    "freelance": "freelance",
    "startup": "start something of their own",
    "remote": "work remotely",
    "explore": "explore their options",
}


async def list_mentors(db: AsyncSession, path_slug: str | None, min_rating: float | None) -> list[Mentor]:
    query = select(Mentor).where(Mentor.is_active.is_(True))
    result = await db.execute(query)
    mentors = list(result.scalars().all())
    if path_slug:
        mentors = [m for m in mentors if path_slug in (m.paths or [])]
    if min_rating:
        mentors = [m for m in mentors if m.rating_avg >= min_rating]
    return mentors


async def get_mentor(db: AsyncSession, mentor_id: uuid.UUID) -> Mentor | None:
    result = await db.execute(select(Mentor).where(Mentor.id == mentor_id))
    return result.scalar_one_or_none()


def _charge_placeholder(amount_cents: int, currency: str) -> str | None:
    """Integration point for Phase 2: call Stripe PaymentIntents (or a
    regional processor for emerging markets, e.g. Flutterwave/Paystack) here.
    Returns a payment_provider_ref, or None when unconfigured (current state).
    """
    return None


async def _active_path_for_user(db: AsyncSession, user_id: uuid.UUID) -> CareerPath | None:
    roadmap = (
        await db.execute(
            select(Roadmap).where(Roadmap.user_id == user_id, Roadmap.status == RoadmapStatus.active)
        )
    ).scalars().first()
    if roadmap is None:
        return None
    return (await db.execute(select(CareerPath).where(CareerPath.id == roadmap.path_id))).scalar_one_or_none()


async def generate_mentee_summary(
    db: AsyncSession, user: User, help_topic: str | None, message: str
) -> str:
    """Deterministic (non-AI) summary built entirely from structured data
    already in the app, so a mentor gets real context before a session
    without an extra model call on every booking."""
    sentences: list[str] = []

    persona_bit = _PERSONA_LABELS.get(user.persona.value if user.persona else "", "Someone")
    goal_bit = _GOAL_LABELS.get(user.goal.value) if user.goal else None
    sentences.append(f"{persona_bit}" + (f" wanting to {goal_bit}." if goal_bit else "."))

    path = await _active_path_for_user(db, user.id)
    if path is not None:
        try:
            snapshot = await skill_gap_service.get_skill_snapshot(db, user, path.slug)
        except Exception:
            snapshot = None
        if snapshot:
            sentences.append(f"Currently at a {snapshot['level'].lower()} level on {path.name}.")
            if snapshot["gaps"]:
                gap_labels = ", ".join(g["label"] for g in snapshot["gaps"])
                sentences.append(f"Biggest skill gaps right now: {gap_labels}.")

    if user.time_budget_minutes_per_day:
        hours = round(user.time_budget_minutes_per_day / 60, 1)
        unit = "hour" if hours == 1 else "hours"
        sentences.append(f"Has about {hours} {unit} available per day.")

    if help_topic:
        topic_label = _HELP_TOPIC_LABELS.get(help_topic, help_topic)
        sentences.append(f"Wants help with: {topic_label}.")

    if message:
        sentences.append(f'In their own words: "{message.strip()}"')

    return " ".join(sentences)


async def book_session(
    db: AsyncSession,
    mentor: Mentor,
    mentee: User,
    scheduled_at: datetime,
    duration_minutes: int,
    help_topic: str | None = None,
    message: str = "",
) -> MentorSession:
    # Founding-mentor launch pricing: free. If/when a mentor sets a real
    # hourly_rate_cents, this still computes it correctly, but
    # _charge_placeholder never actually captures payment either way.
    price = round(mentor.hourly_rate_cents * (duration_minutes / 60)) if mentor.hourly_rate_cents else 0
    payment_ref = _charge_placeholder(price, mentor.currency)
    summary = await generate_mentee_summary(db, mentee, help_topic, message)

    session = MentorSession(
        mentor_id=mentor.id,
        mentee_id=mentee.id,
        scheduled_at=scheduled_at,
        duration_minutes=duration_minutes,
        status=SessionStatus.requested,
        price_cents=price,
        currency=mentor.currency,
        payment_provider_ref=payment_ref,
        help_topic=help_topic,
        mentee_message=message,
        mentee_summary=summary,
    )
    db.add(session)
    mentor.mentee_count = (mentor.mentee_count or 0) + 1
    await db.commit()
    await db.refresh(session)
    return session


async def list_my_sessions(db: AsyncSession, user_id: uuid.UUID) -> list[MentorSession]:
    result = await db.execute(select(MentorSession).where(MentorSession.mentee_id == user_id).order_by(MentorSession.scheduled_at))
    return list(result.scalars().all())


async def get_session(db: AsyncSession, session_id: uuid.UUID) -> MentorSession | None:
    return (await db.execute(select(MentorSession).where(MentorSession.id == session_id))).scalar_one_or_none()


# --- Mentor-dashboard-side session access -----------------------------------


async def list_mentor_sessions(db: AsyncSession, mentor_id: uuid.UUID) -> list[dict]:
    rows = (
        await db.execute(
            select(MentorSession, User.full_name)
            .join(User, User.id == MentorSession.mentee_id)
            .where(MentorSession.mentor_id == mentor_id)
            .order_by(MentorSession.scheduled_at.desc())
        )
    ).all()
    return [{"session": session, "mentee_name": name} for session, name in rows]


async def mentor_earnings_summary(db: AsyncSession, mentor: Mentor) -> dict:
    sessions = (
        await db.execute(select(MentorSession).where(MentorSession.mentor_id == mentor.id))
    ).scalars().all()
    completed = [s for s in sessions if s.status == SessionStatus.completed]
    upcoming = [s for s in sessions if s.status in (SessionStatus.requested, SessionStatus.confirmed)]
    return {
        "total_sessions": len(sessions),
        "completed_sessions": len(completed),
        "upcoming_sessions": len(upcoming),
        "pending_requests": len([s for s in sessions if s.status == SessionStatus.requested]),
        "total_earned_cents": sum(s.price_cents for s in completed),
        "currency": mentor.currency,
    }


# --- Reviews ------------------------------------------------------------


async def list_reviews(db: AsyncSession, mentor_id: uuid.UUID) -> list[MentorReview]:
    result = await db.execute(
        select(MentorReview).where(MentorReview.mentor_id == mentor_id).order_by(MentorReview.created_at.desc())
    )
    return list(result.scalars().all())


async def submit_review(db: AsyncSession, session: MentorSession, rating: int, comment: str) -> MentorReview:
    review = MentorReview(session_id=session.id, mentor_id=session.mentor_id, rating=rating, comment=comment, is_demo=False)
    db.add(review)
    await db.flush()

    agg = (
        await db.execute(
            select(func.avg(MentorReview.rating), func.count(MentorReview.id)).where(
                MentorReview.mentor_id == session.mentor_id
            )
        )
    ).one()
    mentor = await get_mentor(db, session.mentor_id)
    if mentor is not None:
        mentor.rating_avg = round(float(agg[0] or 0), 2)
        mentor.rating_count = int(agg[1] or 0)

    await db.commit()
    await db.refresh(review)
    return review


# --- Private mentor notes -------------------------------------------------


async def upsert_mentor_note(db: AsyncSession, session_id: uuid.UUID, mentor_id: uuid.UUID, payload: dict) -> MentorNote:
    existing = (
        await db.execute(select(MentorNote).where(MentorNote.session_id == session_id, MentorNote.mentor_id == mentor_id))
    ).scalar_one_or_none()
    if existing is None:
        existing = MentorNote(session_id=session_id, mentor_id=mentor_id)
        db.add(existing)
    for key, value in payload.items():
        setattr(existing, key, value)
    await db.commit()
    await db.refresh(existing)
    return existing


# --- Mentee-visible recommendations --------------------------------------


async def create_recommendation(
    db: AsyncSession, session: MentorSession, items: list[dict]
) -> MentorRecommendation:
    rec = MentorRecommendation(
        session_id=session.id, mentor_id=session.mentor_id, mentee_id=session.mentee_id, items=items
    )
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return rec


async def list_recommendations_for_user(db: AsyncSession, user_id: uuid.UUID) -> list[MentorRecommendation]:
    result = await db.execute(
        select(MentorRecommendation).where(MentorRecommendation.mentee_id == user_id).order_by(MentorRecommendation.created_at.desc())
    )
    return list(result.scalars().all())


# --- Claim flow: link a real logged-in User to a seeded/approved Mentor row


async def claim_mentor(db: AsyncSession, user: User) -> Mentor | None:
    mentor = (
        await db.execute(
            select(Mentor).where(Mentor.contact_email == user.email, Mentor.user_id.is_(None))
        )
    ).scalar_one_or_none()
    if mentor is None:
        return None
    mentor.user_id = user.id
    if user.role == Role.user:
        user.role = Role.mentor
    await db.commit()
    await db.refresh(mentor)
    return mentor


async def get_mentor_for_user(db: AsyncSession, user_id: uuid.UUID) -> Mentor | None:
    return (await db.execute(select(Mentor).where(Mentor.user_id == user_id))).scalar_one_or_none()


async def update_mentor_profile(db: AsyncSession, mentor: Mentor, updates: dict) -> Mentor:
    for key, value in updates.items():
        if value is not None:
            setattr(mentor, key, value)
    await db.commit()
    await db.refresh(mentor)
    return mentor


# --- Mentor applications ("apply to become a mentor") ---------------------


async def submit_application(db: AsyncSession, payload: dict) -> MentorApplication:
    application = MentorApplication(**payload)
    db.add(application)
    await db.commit()
    await db.refresh(application)
    return application


async def list_applications(db: AsyncSession, status: ApplicationStatus | None = None) -> list[MentorApplication]:
    query = select(MentorApplication).order_by(MentorApplication.created_at.desc())
    if status is not None:
        query = query.where(MentorApplication.status == status)
    return list((await db.execute(query)).scalars().all())


async def get_application(db: AsyncSession, application_id: uuid.UUID) -> MentorApplication | None:
    return (
        await db.execute(select(MentorApplication).where(MentorApplication.id == application_id))
    ).scalar_one_or_none()


async def approve_application(db: AsyncSession, application: MentorApplication, reviewer_note: str = "") -> Mentor:
    """Creates a real, but explicitly unverified, Mentor row from the
    application. No automated identity/expertise verification happens here
    — is_verified stays False until an admin manually reviews and flips it."""
    mentor = Mentor(
        display_name=application.applicant_name,
        headline=application.headline,
        bio=application.bio,
        avatar_seed=application.applicant_name.split(" ")[0].lower() if application.applicant_name else "mentor",
        paths=application.paths,
        years_experience=application.years_experience,
        hourly_rate_cents=0,
        currency="USD",
        is_verified=False,
        is_active=True,
        is_demo=False,
        is_founding_mentor=False,
        contact_email=application.applicant_email,
    )
    db.add(mentor)
    application.status = ApplicationStatus.approved
    application.reviewer_note = reviewer_note
    application.reviewed_at = datetime.utcnow()
    await db.commit()
    await db.refresh(mentor)
    return mentor


async def reject_application(db: AsyncSession, application: MentorApplication, reviewer_note: str = "") -> MentorApplication:
    application.status = ApplicationStatus.rejected
    application.reviewer_note = reviewer_note
    application.reviewed_at = datetime.utcnow()
    await db.commit()
    await db.refresh(application)
    return application
