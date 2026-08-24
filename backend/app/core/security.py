"""
Password hashing and JWT issuing/verification.

Security notes:
- Passwords are hashed with bcrypt (via passlib) — never stored or logged in
  plaintext, never included in API responses or audit logs.
- JWTs are short-lived access tokens + longer-lived refresh tokens, both
  signed with HS256 using JWT_SECRET_KEY. In production this secret MUST be
  a long random value injected via environment/secrets manager, never
  committed — see .env.example.
- Email verification / password reset links use a separate, single-use,
  expiring token, not a JWT. Only its SHA-256 hash is ever persisted, see
  generate_secure_token/hash_token below and app.models.email.EmailToken.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Literal
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_token(subject: UUID, token_type: Literal["access", "refresh"]) -> str:
    now = datetime.now(timezone.utc)
    expire_minutes = (
        settings.ACCESS_TOKEN_EXPIRE_MINUTES
        if token_type == "access"
        else settings.REFRESH_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(minutes=expire_minutes),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc


def generate_secure_token() -> str:
    """A high-entropy, URL-safe random token for one-time email links
    (verification, password reset). Not a JWT: it carries no data of its
    own, it's just an unguessable lookup key, the real state lives in the
    EmailToken row it hashes to."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """SHA-256 is intentionally used here instead of bcrypt: this hashes a
    32-byte random token (already far too high-entropy to brute-force),
    not a user-chosen secret, so a fast, deterministic hash is correct and
    lets token lookup use an indexed equality query."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
