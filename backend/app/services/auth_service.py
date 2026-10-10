import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_token, generate_secure_token, hash_password, hash_token, verify_password
from app.models.email import EmailToken, EmailTokenPurpose
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services import email_service

logger = logging.getLogger("careerfound.auth")

VERIFICATION_TOKEN_TTL = timedelta(hours=48)
PASSWORD_RESET_TOKEN_TTL = timedelta(hours=1)


VERIFICATION_RESEND_COOLDOWN = timedelta(seconds=60)

LINK_INVALID_MESSAGE = "This verification link is not valid. Open the newest email from CareerFound, or request a new link."
LINK_EXPIRED_MESSAGE = "This verification link has expired. Request a new one and we will email it to you."
LINK_REPLACED_MESSAGE = "A newer verification email replaced this link. Open the most recent email from CareerFound, or request a new link."


class AuthError(Exception):
    def __init__(self, message: str, code: str = "auth_error"):
        super().__init__(message)
        self.code = code


class EmailDeliveryError(Exception):
    """The email provider did not accept the message. Raised only where the
    person is waiting on that exact email (a resend), so the app can say so
    instead of claiming something was sent that was not. `code` is a stable
    reason the UI can react to; `setup_problem` marks failures that retrying
    cannot fix until the operator fixes configuration."""

    def __init__(self, message: str, code: str, setup_problem: bool = False):
        super().__init__(message)
        self.code = code
        self.setup_problem = setup_problem


class ResendCooldownError(Exception):
    def __init__(self, retry_after: int):
        super().__init__(f"Please wait {retry_after} seconds before requesting another email.")
        self.retry_after = retry_after


def mask_email(address: str) -> str:
    return email_service.mask_email(address)


def delivery_error_for(result: "email_service.EmailResult") -> EmailDeliveryError:
    """Turns a failed send into wording that is true. Setup problems are
    ours (credentials, sender domain), so the person is told it is not
    their address and not to keep hammering the button; passing outages
    say to try again soon."""
    if result.status == "address_rejected":
        return EmailDeliveryError(
            "The email service rejected this address. Check it for typos, or change it below.",
            "email_address_rejected",
        )
    if result.is_setup_problem:
        return EmailDeliveryError(
            "Verification emails are not working on our side right now. Your account is saved and your address is fine. "
            f"Please try again later, or write to {settings.EMAIL_REPLY_TO} and we will help.",
            "email_not_configured",
            setup_problem=True,
        )
    return EmailDeliveryError(
        "Our email service is temporarily unavailable. Nothing is wrong with your account. Please try again in a few minutes.",
        "email_temporarily_unavailable",
    )


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
    # Verification goes first and on its own: the welcome email is a nicety,
    # the verification link is what the account actually needs.
    try:
        await send_verification_email_for(db, user)
    except Exception:
        logger.exception("Failed to send verification email for user %s", user.id)
    try:
        await email_service.send_welcome_email(user)
    except Exception:
        logger.exception("Failed to send welcome email for user %s", user.id)

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


def _as_utc(value: datetime) -> datetime:
    """sqlite hands back naive datetimes, Postgres aware ones; both mean UTC here."""
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


async def verification_cooldown_remaining(db: AsyncSession, user: User) -> int:
    """Seconds until another verification email may be requested. Derived
    from the newest verification token the user holds, so it survives
    restarts and works across several server instances. A send that
    failed deletes its token (see send_verification_email_for), so a
    failure never starts a cooldown the person did nothing to earn."""
    result = await db.execute(
        select(EmailToken.created_at)
        .where(EmailToken.user_id == user.id, EmailToken.purpose == EmailTokenPurpose.email_verification)
        .order_by(EmailToken.created_at.desc())
        .limit(1)
    )
    newest = result.scalar_one_or_none()
    if newest is None:
        return 0
    remaining = VERIFICATION_RESEND_COOLDOWN - (datetime.now(timezone.utc) - _as_utc(newest))
    return max(0, int(remaining.total_seconds()) + (1 if remaining.total_seconds() % 1 else 0))


async def send_verification_email_for(db: AsyncSession, user: User) -> "email_service.EmailResult":
    """Issues a fresh link, asks the provider to send it, and only then
    retires the older links. If the provider refuses, the new token is
    discarded and any earlier link that did reach the person keeps
    working, so a failed resend can never strand them."""
    now = datetime.now(timezone.utc)
    raw_token = generate_secure_token()
    row = EmailToken(
        user_id=user.id,
        purpose=EmailTokenPurpose.email_verification,
        token_hash=hash_token(raw_token),
        expires_at=now + VERIFICATION_TOKEN_TTL,
    )
    db.add(row)
    await db.commit()
    try:
        result = email_service.as_result(await email_service.send_verification_email(user, raw_token))
    except Exception:
        logger.exception("Verification email raised for user %s", user.id)
        result = email_service.EmailResult(False, "provider_unavailable", detail="exception while sending")
    if not result.ok:
        await db.delete(row)
        await db.commit()
        return result
    await db.execute(
        update(EmailToken)
        .where(
            EmailToken.user_id == user.id,
            EmailToken.purpose == EmailTokenPurpose.email_verification,
            EmailToken.used_at.is_(None),
            EmailToken.id != row.id,
        )
        .values(used_at=now)
    )
    await db.commit()
    return result


async def resend_verification_email(db: AsyncSession, user: User) -> "email_service.EmailResult":
    if user.email_verified:
        raise AuthError("This email address is already verified.", "already_verified")
    wait = await verification_cooldown_remaining(db, user)
    if wait > 0:
        raise ResendCooldownError(wait)
    result = await send_verification_email_for(db, user)
    if not result.ok:
        raise delivery_error_for(result)
    return result


async def change_unverified_email(db: AsyncSession, user: User, new_email: str, password: str) -> "email_service.EmailResult":
    """Lets someone who mistyped their address at signup fix it themselves.
    Only for unverified accounts (a verified address is proof of identity
    and changing it is a different, stronger flow), and only with the
    current password, so a stolen session cannot redirect the account's
    mail. The old address stops being able to verify: its links are
    retired as soon as the new email is accepted."""
    if user.email_verified:
        raise AuthError("This address is already verified, so it can't be changed here.", "already_verified")
    if user.password_hash is None or not verify_password(password, user.password_hash):
        raise AuthError("That password is not correct.", "wrong_password")
    new_email = new_email.strip().lower()
    if new_email == user.email:
        raise AuthError("That is already the address on your account.", "same_email")
    taken = await db.execute(select(User.id).where(User.email == new_email))
    if taken.scalar_one_or_none() is not None:
        raise AuthError("An account with this email already exists.", "email_taken")
    previous = user.email
    user.email = new_email
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise AuthError("An account with this email already exists.", "email_taken")
    await db.refresh(user)
    # Links sent to the old address must not be able to verify the new one.
    await db.execute(
        update(EmailToken)
        .where(
            EmailToken.user_id == user.id,
            EmailToken.purpose == EmailTokenPurpose.email_verification,
            EmailToken.used_at.is_(None),
        )
        .values(used_at=datetime.now(timezone.utc))
    )
    await db.commit()
    logger.info("Unverified account %s changed email %s -> %s", user.id, mask_email(previous), mask_email(new_email))
    return await send_verification_email_for(db, user)


async def verify_email(db: AsyncSession, raw_token: str) -> User:
    """Looks the link up first, then explains exactly why it can't be used:
    each outcome (never existed, expired, replaced by a newer email, already
    used on an account that is verified) needs a different next step, so
    they get different codes instead of one vague 'invalid or expired'."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(EmailToken).where(
            EmailToken.token_hash == hash_token(raw_token),
            EmailToken.purpose == EmailTokenPurpose.email_verification,
        )
    )
    token_row = result.scalar_one_or_none()
    if token_row is None:
        raise AuthError(LINK_INVALID_MESSAGE, "link_invalid")
    user = (await db.execute(select(User).where(User.id == token_row.user_id))).scalar_one_or_none()
    if user is None:
        raise AuthError(LINK_INVALID_MESSAGE, "link_invalid")
    if user.email_verified:
        # Also what a mail scanner that opened the link first leaves behind.
        raise AuthError("This email address is already verified. You can sign in.", "already_verified")
    if token_row.used_at is not None:
        raise AuthError(LINK_REPLACED_MESSAGE, "link_replaced")
    if _as_utc(token_row.expires_at) < now:
        raise AuthError(LINK_EXPIRED_MESSAGE, "link_expired")
    token_row.used_at = now
    user.email_verified = True
    user.email_verified_at = now
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
