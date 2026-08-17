import uuid

from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class Assessment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "assessments"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    answers: Mapped[dict] = mapped_column(JSON, default=dict)

    best_match_path_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("career_paths.id"), nullable=True)
    strong_alt_path_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("career_paths.id"), nullable=True)
    wild_card_path_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("career_paths.id"), nullable=True)

    # Full recommendation payload (per-path explanations) so results are
    # stable/reproducible without recomputation, and so history is preserved.
    recommendations: Mapped[dict] = mapped_column(JSON, default=dict)
    career_dna: Mapped[dict] = mapped_column(JSON, default=dict)
