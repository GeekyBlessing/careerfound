import enum

from sqlalchemy import Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


class ServiceRequestType(str, enum.Enum):
    mentorship = "mentorship"
    consultation = "consultation"


class ServiceRequest(Base, UUIDMixin, TimestampMixin):
    """A lead for one of Toriola's own paid offerings (1:1 mentorship or a
    30-minute consultation), captured from the pricing page. This is
    deliberately separate from the Mentor/MentorSession marketplace tables
    in app.models.marketplace: those model third-party mentors booking
    through the marketplace, this models a direct request to CareerFound
    itself. No payment fields here on purpose, there is no live payment
    processor connected yet, this is a request-and-follow-up flow, not a
    checkout.
    """

    __tablename__ = "service_requests"

    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), index=True)
    service: Mapped[ServiceRequestType] = mapped_column(Enum(ServiceRequestType), default=ServiceRequestType.consultation)
    message: Mapped[str] = mapped_column(Text, default="")
