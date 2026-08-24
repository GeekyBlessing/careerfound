import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


class EmailTokenPurpose(str, enum.Enum):
    email_verification = "email_verification"
    password_reset = "password_reset"


class EmailToken(Base, UUIDMixin, TimestampMixin):
    """A single-use, expiring token backing email verification and password
    reset links. Only the SHA-256 hash of the token is ever stored, the raw
    token exists only in the email link itself, so a database read alone
    can never be used to verify an account or reset a password."""

    __tablename__ = "email_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    purpose: Mapped[EmailTokenPurpose] = mapped_column(Enum(EmailTokenPurpose), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<EmailToken {self.purpose} user={self.user_id} used={self.used_at is not None}>"
