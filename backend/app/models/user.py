import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


class Persona(str, enum.Enum):
    student = "student"
    graduate = "graduate"
    working = "working"
    switcher = "switcher"
    entrepreneur = "entrepreneur"
    other = "other"


class Goal(str, enum.Enum):
    job = "job"
    freelance = "freelance"
    startup = "startup"
    remote = "remote"
    explore = "explore"


class DeviceAccess(str, enum.Enum):
    laptop = "laptop"
    smartphone = "smartphone"
    both = "both"


class Plan(str, enum.Enum):
    free = "free"
    pro = "pro"


class Role(str, enum.Enum):
    user = "user"
    mentor = "mentor"
    admin = "admin"


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(64), nullable=True)

    persona: Mapped[Persona | None] = mapped_column(Enum(Persona), nullable=True)
    goal: Mapped[Goal | None] = mapped_column(Enum(Goal), nullable=True)
    device_access: Mapped[DeviceAccess | None] = mapped_column(Enum(DeviceAccess), nullable=True)
    time_budget_minutes_per_day: Mapped[int | None] = mapped_column(Integer, nullable=True)

    beginner_mode: Mapped[bool] = mapped_column(Boolean, default=True)
    plan: Mapped[Plan] = mapped_column(Enum(Plan), default=Plan.free)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.user)

    google_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User {self.email}>"
