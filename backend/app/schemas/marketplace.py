import datetime
import uuid
from datetime import datetime as dt

from pydantic import BaseModel, Field


class MentorOut(BaseModel):
    id: uuid.UUID
    display_name: str
    headline: str
    bio: str
    avatar_seed: str
    avatar_url: str | None = None
    paths: list[str]
    years_experience: int | None = None
    hourly_rate_cents: int
    currency: str
    rating_avg: float
    rating_count: int
    is_verified: bool
    is_demo: bool
    is_founding_mentor: bool
    languages: list[str]
    mentorship_formats: list[str]
    session_durations_minutes: list[int]
    value_proposition: str
    availability_note: str
    mentee_count: int

    model_config = {"from_attributes": True}


class MentorProfileUpdate(BaseModel):
    """Fields a mentor can edit about their own profile (PATCH /mentors/me/profile).
    Everything is optional so a partial update is possible; nothing here lets
    a mentor set is_verified, is_founding_mentor, is_demo, or rating fields —
    those stay outside self-service editing.
    """

    headline: str | None = None
    bio: str | None = None
    value_proposition: str | None = None
    years_experience: int | None = None
    languages: list[str] | None = None
    mentorship_formats: list[str] | None = None
    session_durations_minutes: list[int] | None = None
    availability_note: str | None = None
    paths: list[str] | None = None


HELP_TOPICS = (
    "choose_career",
    "start_cybersecurity",
    "need_roadmap",
    "project_help",
    "portfolio_guidance",
    "career_advice",
    "other",
)


class BookSessionRequest(BaseModel):
    scheduled_at: dt
    duration_minutes: int = 30
    help_topic: str | None = None
    message: str = ""
    # Deprecated alias kept so any older client that still sends `note`
    # doesn't silently lose data — mapped onto `message` server-side.
    note: str = ""


class MentorSessionOut(BaseModel):
    id: uuid.UUID
    mentor_id: uuid.UUID
    scheduled_at: dt
    duration_minutes: int
    status: str
    price_cents: int
    currency: str
    help_topic: str | None = None
    mentee_message: str = ""
    mentee_summary: str = ""
    payment_integration_note: str = (
        "Payment processing is architected (Stripe integration point in "
        "app/services/marketplace_service.py) but not wired to a live "
        "processor in this build. Sessions are created in 'requested' status."
    )

    model_config = {"from_attributes": True}


class MentorSessionDetailOut(MentorSessionOut):
    """Mentor-dashboard view of a session — includes the mentee's identity,
    which the plain MentorSessionOut (used on the mentee's own booking
    confirmation) does not need to repeat back."""

    mentee_id: uuid.UUID
    mentee_name: str = ""


class ReviewRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class MentorReviewOut(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    rating: int
    comment: str
    is_demo: bool
    created_at: dt

    model_config = {"from_attributes": True}


class MentorMatchOut(BaseModel):
    """One ranked mentor recommendation for a user's specific career path,
    with a reason generated from the user's real skill-gap data — not a
    generic listing."""

    mentor: MentorOut
    score: int
    reason: str


class SkillGapItemOut(BaseModel):
    key: str
    label: str
    category: str
    mastery_pct: int


class SkillSnapshotOut(BaseModel):
    path_slug: str
    level: str  # "Beginner" | "Intermediate" | "Advanced" | "Not started"
    mastery_avg: int
    gaps: list[SkillGapItemOut]


class MentorRecommendationRequestOut(BaseModel):
    """GET /mentors/recommended response: the skill snapshot plus ranked matches."""

    snapshot: SkillSnapshotOut
    matches: list[MentorMatchOut]


class MentorNoteIn(BaseModel):
    what_to_work_on: str = ""
    recommended_resources: list[str] = []
    recommended_projects: list[str] = []
    next_steps: str = ""
    follow_up_date: datetime.date | None = None


class MentorNoteOut(MentorNoteIn):
    id: uuid.UUID
    session_id: uuid.UUID

    model_config = {"from_attributes": True}


class RecommendationItemIn(BaseModel):
    title: str
    description: str = ""
    item_type: str = "follow_up"  # skill | project | follow_up


class MentorRecommendationIn(BaseModel):
    items: list[RecommendationItemIn]


class MentorRecommendationOut(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    mentor_id: uuid.UUID
    items: list[RecommendationItemIn]
    created_at: dt

    model_config = {"from_attributes": True}


class MentorEarningsSummaryOut(BaseModel):
    total_sessions: int
    completed_sessions: int
    upcoming_sessions: int
    pending_requests: int
    total_earned_cents: int
    currency: str
    note: str = "Sessions are free during the founding-mentor launch — earnings will reflect real charges once pricing is turned on."


class MentorApplicationIn(BaseModel):
    applicant_name: str
    applicant_email: str
    headline: str = ""
    bio: str = ""
    paths: list[str] = []
    years_experience: int | None = None


class MentorApplicationOut(BaseModel):
    id: uuid.UUID
    applicant_name: str
    applicant_email: str
    headline: str
    bio: str
    paths: list[str]
    years_experience: int | None
    status: str
    reviewer_note: str
    created_at: dt

    model_config = {"from_attributes": True}


class MentorApplicationReviewRequest(BaseModel):
    reviewer_note: str = ""


SESSION_STATUSES = ("requested", "confirmed", "completed", "cancelled")


class SessionStatusUpdate(BaseModel):
    status: str

    def validate_status(self) -> None:
        if self.status not in SESSION_STATUSES:
            raise ValueError(f"status must be one of {SESSION_STATUSES}")


class AskQuestionRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
