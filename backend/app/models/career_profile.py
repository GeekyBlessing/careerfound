"""CareerFound 2.0: the person-level records that sit around the learning
journey (self-declared skills and certifications, the public profile, saved
job analyses).

Nothing in this module is evidence on its own. Skills and certifications are
what a person says about themselves, and the readiness and portfolio code
treats them that way: they are shown, labelled self-reported, and never counted
as proof.
"""

import datetime
import uuid

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class UserSkill(Base, UUIDMixin, TimestampMixin):
    """A skill the person says they have. Self-reported by definition."""

    __tablename__ = "user_skills"
    __table_args__ = (UniqueConstraint("user_id", "name_key", name="uq_user_skill_name"),)

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(80))
    name_key: Mapped[str] = mapped_column(String(80))  # lowercased, used for matching
    level: Mapped[str] = mapped_column(String(20), default="learning")  # learning | comfortable | strong


class UserCertification(Base, UUIDMixin, TimestampMixin):
    """A certification the person holds or is working towards. Self-reported:
    CareerFound does not verify issuers, so a credential link is shown for the
    reader to check, and the entry never counts towards readiness proof."""

    __tablename__ = "user_certifications"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(160))
    issuer: Mapped[str] = mapped_column(String(120), default="")
    status: Mapped[str] = mapped_column(String(20), default="earned")  # earned | in_progress
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    credential_url: Mapped[str] = mapped_column(String(300), default="")


class PublicProfile(Base, UUIDMixin, TimestampMixin):
    """The page at /u/<username>. Private until the person turns it on, and
    every section on it is something they chose to show."""

    __tablename__ = "public_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    headline: Mapped[str] = mapped_column(String(140), default="")
    bio: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(80), default="")
    github_url: Mapped[str] = mapped_column(String(300), default="")
    linkedin_url: Mapped[str] = mapped_column(String(300), default="")
    website_url: Mapped[str] = mapped_column(String(300), default="")
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    show_readiness: Mapped[bool] = mapped_column(Boolean, default=True)
    show_skills: Mapped[bool] = mapped_column(Boolean, default=True)
    show_certifications: Mapped[bool] = mapped_column(Boolean, default=True)


class JobAnalysis(Base, UUIDMixin, TimestampMixin):
    """A job description the person pasted, and what CareerFound found when it
    compared the description with their own record. The posting is entered by
    the user; CareerFound never invents or scrapes listings."""

    __tablename__ = "job_analyses"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(160), default="")
    company: Mapped[str] = mapped_column(String(160), default="")
    source_url: Mapped[str] = mapped_column(String(400), default="")
    description: Mapped[str] = mapped_column(Text)
    result: Mapped[dict] = mapped_column(JSON, default=dict)
    match_pct: Mapped[int] = mapped_column(Integer, default=0)
    verdict: Mapped[str] = mapped_column(String(20), default="")  # ready | strengthen
    analysed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
