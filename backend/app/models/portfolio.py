import uuid

from sqlalchemy import JSON, Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class PortfolioItem(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "portfolio_items"

    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), index=True)
    project_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String(200))
    project_description: Mapped[str] = mapped_column(Text, default="")
    readme_draft: Mapped[str] = mapped_column(Text, default="")
    cv_bullet: Mapped[str] = mapped_column(Text, default="")
    linkedin_blurb: Mapped[str] = mapped_column(Text, default="")
    case_study_md: Mapped[str] = mapped_column(Text, default="")
    skills_demonstrated: Mapped[list] = mapped_column(JSON, default=list)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
