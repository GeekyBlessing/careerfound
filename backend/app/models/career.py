import uuid

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class CareerPath(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "career_paths"

    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    summary: Mapped[str] = mapped_column(Text)
    beginner_summary: Mapped[str] = mapped_column(Text, default="")
    difficulty: Mapped[int] = mapped_column(Integer, default=2)  # 1-5
    avg_timeline_weeks: Mapped[int] = mapped_column(Integer, default=24)
    entry_roles: Mapped[list] = mapped_column(JSON, default=list)
    tools: Mapped[list] = mapped_column(JSON, default=list)
    remote_potential: Mapped[int] = mapped_column(Integer, default=70)  # 0-100
    earning_notes: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(32), default="sparkles")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Career-directory depth fields. These are deliberately kept separate
    # from `tools` (which is tools/technologies) and `entry_roles` (job
    # titles): `skills_required` is the underlying competencies (e.g.
    # "Networking fundamentals"), distinct from the software you use them
    # in. `roadmap_outline` is a short, real, per-tier "what to focus on"
    # guide, not a substitute for the full lesson/exercise/quiz curriculum
    # that only 2 paths have today (see docs/PHASE_2.md item #5) — every
    # path gets this lighter outline, not every path gets full lessons.
    skills_required: Mapped[list] = mapped_column(JSON, default=list)
    certifications: Mapped[list] = mapped_column(JSON, default=list)
    interview_prep: Mapped[list] = mapped_column(JSON, default=list)
    # list[{"label": str, "note": str}]
    learning_resources: Mapped[list] = mapped_column(JSON, default=list)
    # {"beginner": list[str], "intermediate": list[str], "advanced": list[str]}
    roadmap_outline: Mapped[dict] = mapped_column(JSON, default=dict)


class PathFitRule(Base, UUIDMixin, TimestampMixin):
    """Declarative scoring rule: how much a given profile trait/answer should
    push a user's fit score for a career path, and in which direction.
    """

    __tablename__ = "path_fit_rules"

    path_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("career_paths.id"))
    trait_key: Mapped[str] = mapped_column(String(80))  # e.g. "enjoys_math", "prefers_systems"
    match_value: Mapped[str] = mapped_column(String(80))  # value that triggers the rule
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    direction: Mapped[int] = mapped_column(Integer, default=1)  # 1 = positive, -1 = negative
