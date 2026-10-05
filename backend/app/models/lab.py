import datetime
import uuid

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class ProjectLabProgress(Base, UUIDMixin, TimestampMixin):
    """One person's evidence on one Project Lab project.

    Nothing here is a status flag that someone can click to claim progress.
    It stores what the person actually did (milestones they ticked, checklist
    items they confirmed, the repository they linked, the interview answers
    they wrote) and the lab service derives the stage from that evidence.
    """

    __tablename__ = "project_lab_progress"
    __table_args__ = (UniqueConstraint("user_id", "project_id", name="uq_lab_progress_user_project"),)

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    project_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("projects.id"), index=True)
    started_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    milestones: Mapped[list] = mapped_column(JSON, default=list)  # keys of milestones marked done
    checklist: Mapped[dict] = mapped_column(JSON, default=dict)  # item key -> bool
    repo_url: Mapped[str] = mapped_column(String(300), default="")
    repo_check: Mapped[dict] = mapped_column(JSON, default=dict)  # last repository check result
    interview_answers: Mapped[dict] = mapped_column(JSON, default=dict)  # question key -> the person's own notes

    # Human review. Verification is only ever claimed when a real reviewer
    # (a mentor or an admin) approved this exact repository. submitted_* is
    # set by the learner, reviewed_* by the reviewer, never by the learner.
    submitted_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    submitted_note: Mapped[str] = mapped_column(Text, default="")
    submitted_repo_url: Mapped[str] = mapped_column(String(300), default="")
    review_status: Mapped[str] = mapped_column(String(20), default="none")  # none | pending | approved | changes_requested
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("users.id"), nullable=True)
    reviewer_name: Mapped[str] = mapped_column(String(160), default="")
    reviewed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_note: Mapped[str] = mapped_column(Text, default="")
