import datetime
import enum
import uuid

from sqlalchemy import JSON, Boolean, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class SessionStatus(str, enum.Enum):
    requested = "requested"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Mentor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mentors"

    user_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("users.id"), nullable=True)
    # A stable, human-readable public identifier (e.g. "mobile-engineering-mentor")
    # so a mentor's profile URL (/mentors/{slug}) doesn't depend on exposing or
    # guessing their database UUID. Nullable/unique: most seeded demo mentors
    # don't have one and are still looked up by UUID at GET /mentors/{mentor_id}
    # (see marketplace_service.get_mentor, which accepts either form).
    slug: Mapped[str | None] = mapped_column(String(160), unique=True, nullable=True, index=True)
    display_name: Mapped[str] = mapped_column(String(160))
    headline: Mapped[str] = mapped_column(String(240))
    bio: Mapped[str] = mapped_column(Text, default="")
    avatar_seed: Mapped[str] = mapped_column(String(80), default="mentor")
    paths: Mapped[list] = mapped_column(JSON, default=list)  # career_path slugs
    years_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    hourly_rate_cents: Mapped[int] = mapped_column(Integer, default=5000)
    currency: Mapped[str] = mapped_column(String(6), default="USD")
    rating_avg: Mapped[float] = mapped_column(Float, default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # --- Real vs. demo data, and the "founding mentor" program ---
    # is_demo distinguishes the seeded fictional marketplace personas from
    # real people. is_founding_mentor is a launch-cohort label ONLY — it
    # must never be read as a verification claim (see is_verified, which
    # stays a separate, manually-set flag).
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    is_founding_mentor: Mapped[bool] = mapped_column(Boolean, default=False)
    # Used only by the self-serve claim flow (POST /mentors/claim) to link a
    # real logged-in User to this row once they register with this email.
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # --- Profile richness for real mentors ---
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    languages: Mapped[list] = mapped_column(JSON, default=lambda: ["English"])
    mentorship_formats: Mapped[list] = mapped_column(JSON, default=lambda: ["video_call"])
    session_durations_minutes: Mapped[list] = mapped_column(JSON, default=lambda: [30, 60])
    value_proposition: Mapped[str] = mapped_column(Text, default="")
    focus_beginner_friendly: Mapped[bool] = mapped_column(Boolean, default=False)
    # Free-text placeholder, there is no real calendar/scheduling system yet.
    availability_note: Mapped[str] = mapped_column(
        Text, default="Availability coming soon: check back or ask a question."
    )
    mentee_count: Mapped[int] = mapped_column(Integer, default=0)

    # --- Named, fixed-price service offerings (distinct from the generic
    # hourly_rate_cents used by the fictional demo marketplace mentors).
    # Stored as pre-formatted display labels rather than raw numbers plus a
    # currency-conversion pipeline, since these are specific, manually-set
    # prices for one real mentor's real services, not a computed rate. Empty
    # string means "this mentor does not offer this service" — the frontend
    # only renders a service card when its label is non-empty.
    mentorship_duration_label: Mapped[str] = mapped_column(String(80), default="")
    mentorship_price_label: Mapped[str] = mapped_column(String(80), default="")
    consultation_duration_label: Mapped[str] = mapped_column(String(80), default="")
    consultation_price_label: Mapped[str] = mapped_column(String(80), default="")


class MentorSession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mentor_sessions"

    mentor_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("mentors.id"), index=True)
    mentee_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    scheduled_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    status: Mapped[SessionStatus] = mapped_column(Enum(SessionStatus), default=SessionStatus.requested)
    price_cents: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(6), default="USD")
    # Integration point: populated once Stripe (or a regional processor) is
    # wired in Phase 2. Left nullable and unused by any live payment flow.
    payment_provider_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # --- Booking intake, so the mentor gets real context instead of a bare timestamp ---
    help_topic: Mapped[str | None] = mapped_column(String(80), nullable=True)
    mentee_message: Mapped[str] = mapped_column(Text, default="")
    # Server-generated at booking time from structured profile/roadmap data
    # (see marketplace_service.generate_mentee_summary) — never mentee-editable.
    mentee_summary: Mapped[str] = mapped_column(Text, default="")


class MentorReview(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mentor_reviews"

    session_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("mentor_sessions.id"), index=True)
    mentor_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("mentors.id"), index=True)
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(Text, default="")
    # True only for reviews created by the review-seeding path for demo
    # mentors (if any are ever added) — real reviews from real sessions are
    # always False. Surfaced in the UI as "DEMO REVIEW" when True.
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)


class MentorNote(Base, UUIDMixin, TimestampMixin):
    """Private mentor-only notes about a session. Never exposed on any
    mentee-facing schema or route — only reachable via mentor-dashboard
    endpoints gated by require_mentor_owner."""

    __tablename__ = "mentor_notes"

    session_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("mentor_sessions.id"), index=True)
    mentor_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("mentors.id"), index=True)
    what_to_work_on: Mapped[str] = mapped_column(Text, default="")
    recommended_resources: Mapped[list] = mapped_column(JSON, default=list)
    recommended_projects: Mapped[list] = mapped_column(JSON, default=list)
    next_steps: Mapped[str] = mapped_column(Text, default="")
    follow_up_date: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)


class MentorRecommendation(Base, UUIDMixin, TimestampMixin):
    """Mentee-visible recommendations a mentor makes after a session. Items
    can be pulled into the mentee's roadmap as a RoadmapCustomItem."""

    __tablename__ = "mentor_recommendations"

    session_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("mentor_sessions.id"), index=True)
    mentor_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("mentors.id"), index=True)
    mentee_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    # list[{"title": str, "description": str, "item_type": "skill"|"project"|"follow_up"}]
    items: Mapped[list] = mapped_column(JSON, default=list)


class MentorApplication(Base, UUIDMixin, TimestampMixin):
    """A real professional applying to become a mentor. Approval creates a
    real (but explicitly unverified) Mentor row — no automated identity or
    expertise verification is performed."""

    __tablename__ = "mentor_applications"

    applicant_name: Mapped[str] = mapped_column(String(160))
    applicant_email: Mapped[str] = mapped_column(String(255))
    headline: Mapped[str] = mapped_column(String(240), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    paths: Mapped[list] = mapped_column(JSON, default=list)
    years_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus), default=ApplicationStatus.pending)
    reviewer_note: Mapped[str] = mapped_column(Text, default="")
    reviewed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
