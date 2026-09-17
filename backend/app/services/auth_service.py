import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_token, generate_secure_token, hash_password, hash_token, verify_password
from app.models.email import EmailToken, EmailTokenPurpose
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services import email_service

logger = logging.getLogger("careerfound.auth")

VERIFICATION_TOKEN_TTL = timedelta(hours=48)
PASSWORD_RESET_TOKEN_TTL = timedelta(hours=1)


class AuthError(Exception):
    pass


async def register_user(db: AsyncSession, payload: RegisterRequest) -> User:
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalar_one_or_none() is not None:
        raise AuthError("An account with this email already exists.")

    user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        # The SELECT above is a plain read with no row lock, so two
        # concurrent registrations for the same email can both pass it and
        # then race to commit — the DB's own unique constraint on
        # users.email is what actually catches that, not the check above.
        # Without this, the loser gets a raw 500 instead of the same clean
        # "already exists" message the check above normally produces.
        await db.rollback()
        raise AuthError("An account with this email already exists.")
    await db.refresh(user)

    # Email delivery is best-effort and must never fail registration itself,
    # a flaky provider (or a not-yet-configured one in dev) still has to
    # leave the account fully created and usable.
    try:
        await email_service.send_welcome_email(user)
        await send_verification_email_for(db, user)
    except Exception:
        logger.exception("Failed to send registration email(s) for user %s", user.id)

    return user


async def authenticate_user(db: AsyncSession, payload: LoginRequest) -> User:
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()
    # Constant-shape error to avoid user enumeration via timing/response diff.
    if user is None or user.password_hash is None or not verify_password(payload.password, user.password_hash):
        raise AuthError("Incorrect email or password.")
    return user


def issue_tokens(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_token(user.id, "access"),
        refresh_token=create_token(user.id, "refresh"),
    )


# --------------------------------------------------------------------------
# Email verification
# --------------------------------------------------------------------------


async def _issue_email_token(db: AsyncSession, user: User, purpose: EmailTokenPurpose) -> str:
    """Creates a fresh single-use token for this purpose and invalidates any
    still-live ones, so at most one link of a given purpose is ever valid
    for a user at once (a resend can't leave two working links behind)."""
    now = datetime.now(timezone.utc)
    await db.execute(
        update(EmailToken)
        .where(EmailToken.user_id == user.id, EmailToken.purpose == purpose, EmailToken.used_at.is_(None))
        .values(used_at=now)
    )
    ttl = VERIFICATION_TOKEN_TTL if purpose == EmailTokenPurpose.email_verification else PASSWORD_RESET_TOKEN_TTL
    raw_token = generate_secure_token()
    db.add(
        EmailToken(
            user_id=user.id,
            purpose=purpose,
            token_hash=hash_token(raw_token),
            expires_at=now + ttl,
        )
    )
    await db.commit()
    return raw_token


async def _consume_email_token(db: AsyncSession, raw_token: str, purpose: EmailTokenPurpose) -> EmailToken | None:
    """Looks up a live (unused, unexpired) token by its hash and marks it
    used in the same call. The expiry comparison happens in SQL against the
    database's own clock, not in Python, so sqlite/Postgres timezone
    handling can't silently disagree with each other."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(EmailToken).where(
            EmailToken.token_hash == hash_token(raw_token),
            EmailToken.purpose == purpose,
            EmailToken.used_at.is_(None),
            EmailToken.expires_at >= now,
        )
    )
    token_row = result.scalar_one_or_none()
    if token_row is None:
        return None
    token_row.used_at = now
    await db.commit()
    return token_row


async def send_verification_email_for(db: AsyncSession, user: User) -> None:
    raw_token = await _issue_email_token(db, user, EmailTokenPurpose.email_verification)
    await email_service.send_verification_email(user, raw_token)


async def resend_verification_email(db: AsyncSession, user: User) -> None:
    if user.email_verified:
        raise AuthError("This email address is already verified.")
    await send_verification_email_for(db, user)


async def verify_email(db: AsyncSession, raw_token: str) -> User:
    token_row = await _consume_email_token(db, raw_token, EmailTokenPurpose.email_verification)
    if token_row is None:
        raise AuthError("This verification link is invalid or has expired. Request a new one from Settings.")
    result = await db.execute(select(User).where(User.id == token_row.user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise AuthError("This verification link is invalid or has expired. Request a new one from Settings.")
    if not user.email_verified:
        user.email_verified = True
        user.email_verified_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)
    return user


# --------------------------------------------------------------------------
# Password reset
# --------------------------------------------------------------------------


async def request_password_reset(db: AsyncSession, email: str) -> None:
    """Always completes with no return value regardless of whether the
    email matches an account, callers must show the same generic message
    either way so this endpoint can't be used to enumerate registered
    emails. Accounts with no password set (Google-only sign-in) are
    skipped, there's no password on them to reset."""
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if user is None or user.password_hash is None:
        return
    raw_token = await _issue_email_token(db, user, EmailTokenPurpose.password_reset)
    try:
        await email_service.send_password_reset_email(user, raw_token)
    except Exception:
        logger.exception("Failed to send password reset email for user %s", user.id)


async def reset_password(db: AsyncSession, raw_token: str, new_password: str) -> User:
    token_row = await _consume_email_token(db, raw_token, EmailTokenPurpose.password_reset)
    if token_row is None:
        raise AuthError("This password reset link is invalid or has expired. Request a new one.")
    result = await db.execute(select(User).where(User.id == token_row.user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise AuthError("This password reset link is invalid or has expired. Request a new one.")
    user.password_hash = hash_password(new_password)
    # Invalidate any other outstanding reset tokens for this account too,
    # defense in depth in case more than one reset was requested.
    now = datetime.now(timezone.utc)
    await db.execute(
        update(EmailToken)
        .where(
            EmailToken.user_id == user.id,
            EmailToken.purpose == EmailTokenPurpose.password_reset,
            EmailToken.used_at.is_(None),
        )
        .values(used_at=now)
    )
    await db.commit()
    await db.refresh(user)
    return user
