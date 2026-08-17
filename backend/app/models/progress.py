import datetime
import enum
import uuid

from sqlalchemy import JSON, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class ProgressStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"


class UserProgress(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("lessons.id"), nullable=True)
    project_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("projects.id"), nullable=True)
    quiz_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("quizzes.id"), nullable=True)
    exercise_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("exercises.id"), nullable=True)
    status: Mapped[ProgressStatus] = mapped_column(Enum(ProgressStatus), default=ProgressStatus.not_started)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    completed_at: Mapped[datetime.datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class UserSkillProgress(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_skill_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    skill_node_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("skill_nodes.id"), index=True)
    mastery_pct: Mapped[int] = mapped_column(Integer, default=0)


class DailyMission(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "daily_missions"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    date: Mapped[datetime.date] = mapped_column(Date)
    tasks: Mapped[list] = mapped_column(JSON, default=list)
    rationale_text: Mapped[str] = mapped_column(Text, default="")


class ReadinessScore(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "readiness_scores"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    overall: Mapped[int] = mapped_column(Integer, default=0)
    knowledge_pct: Mapped[int] = mapped_column(Integer, default=0)
    projects_pct: Mapped[int] = mapped_column(Integer, default=0)
    portfolio_pct: Mapped[int] = mapped_column(Integer, default=0)
    interview_pct: Mapped[int] = mapped_column(Integer, default=0)
    practical_pct: Mapped[int] = mapped_column(Integer, default=0)
    next_actions: Mapped[list] = mapped_column(JSON, default=list)


class Simulation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "simulations"

    path_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("career_paths.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    scenario_md: Mapped[str] = mapped_column(Text)
    options: Mapped[list] = mapped_column(JSON, default=list)
    correct_option: Mapped[str] = mapped_column(String(10))
    explanation_md: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[int] = mapped_column(Integer, default=1)


class UserSimulationAttempt(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_simulation_attempts"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    simulation_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("simulations.id"))
    chosen_option: Mapped[str] = mapped_column(String(10))
    correct: Mapped[bool] = mapped_column(default=False)


class Streak(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "streaks"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), unique=True, index=True)
    current_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)


class XPEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "xp_events"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(200))
