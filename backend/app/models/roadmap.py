import enum
import uuid

from sqlalchemy import JSON, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class RoadmapStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    archived = "archived"


class Roadmap(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "roadmaps"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    path_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("career_paths.id"))
    status: Mapped[RoadmapStatus] = mapped_column(Enum(RoadmapStatus), default=RoadmapStatus.active)


class RoadmapPhase(Base, UUIDMixin, TimestampMixin):
    """Phase *templates* are keyed by path_id (roadmap_id is null) and are
    seeded once per career path. A user's Roadmap references phases through
    the path template — this avoids duplicating content per user while still
    allowing per-user unlock state via user_progress.
    """

    __tablename__ = "roadmap_phases"

    path_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("career_paths.id"), index=True)
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(160))
    summary: Mapped[str] = mapped_column(Text)
    unlocks_at_skill_pct: Mapped[int] = mapped_column(Integer, default=0)


class Lesson(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "lessons"

    phase_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("roadmap_phases.id"), index=True)
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    concept_summary: Mapped[str] = mapped_column(Text)
    beginner_explainer: Mapped[str] = mapped_column(Text, default="")
    content_md: Mapped[str] = mapped_column(Text, default="")
    est_minutes: Mapped[int] = mapped_column(Integer, default=15)
    skill_node_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("skill_nodes.id"), nullable=True)


class Exercise(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "exercises"

    lesson_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("lessons.id"), index=True)
    prompt: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(20), default="mcq")  # mcq | short_answer | scenario
    options: Mapped[list] = mapped_column(JSON, default=list)
    answer_key: Mapped[dict] = mapped_column(JSON, default=dict)
    est_minutes: Mapped[int] = mapped_column(Integer, default=10)


class Project(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "projects"

    phase_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("roadmap_phases.id"), index=True)
    order_index: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))
    teaches: Mapped[str] = mapped_column(Text)
    prerequisites: Mapped[list] = mapped_column(JSON, default=list)
    expected_output: Mapped[str] = mapped_column(Text, default="")
    steps: Mapped[list] = mapped_column(JSON, default=list)
    hints: Mapped[list] = mapped_column(JSON, default=list)
    common_mistakes: Mapped[list] = mapped_column(JSON, default=list)
    difficulty: Mapped[int] = mapped_column(Integer, default=1)
    skill_node_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("skill_nodes.id"), nullable=True)


class Quiz(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "quizzes"

    phase_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("roadmap_phases.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    passing_score: Mapped[int] = mapped_column(Integer, default=70)
    questions: Mapped[list] = mapped_column(JSON, default=list)


class SkillNode(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "skill_nodes"

    path_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("career_paths.id"), index=True)
    key: Mapped[str] = mapped_column(String(80))
    label: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(80), default="core")


class SkillEdge(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "skill_edges"

    path_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("career_paths.id"), index=True)
    from_skill_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("skill_nodes.id"))
    to_skill_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("skill_nodes.id"))


class RoadmapCustomItem(Base, UUIDMixin, TimestampMixin):
    """A mentor-recommended action a mentee accepted into their roadmap.

    Deliberately separate from Project/Lesson/RoadmapPhase, which are shared
    templates across every user on a path — this table is per-user so
    accepting a mentor's recommendation never mutates shared content. The
    roadmap page renders these as an additional "From your mentor" section.
    """

    __tablename__ = "roadmap_custom_items"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    roadmap_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("roadmaps.id"), index=True)
    source_recommendation_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("mentor_recommendations.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    item_type: Mapped[str] = mapped_column(String(20), default="follow_up")  # skill | project | follow_up
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | done
    order_index: Mapped[int] = mapped_column(Integer, default=0)
