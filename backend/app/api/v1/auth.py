from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import decode_token, create_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ChangeEmailRequest,
    EmailPreferencesUpdate,
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserOut,
    VerificationSentOut,
    VerificationStatusOut,
    VerifyEmailRequest,
)
from app.services import auth_service
from app.services.audit_service import log_action

router = APIRouter(prefix="/auth", tags=["auth"])


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else ""


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"register:{_client_ip(request)}", settings.AUTH_RATE_LIMIT_PER_MINUTE)
    try:
        user = await auth_service.register_user(db, payload)
    except auth_service.AuthError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc
    await log_action(db, user_id=user.id, action="register", resource_type="user", resource_id=str(user.id), ip=_client_ip(request))
    return auth_service.issue_tokens(user)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"login:{_client_ip(request)}", settings.AUTH_RATE_LIMIT_PER_MINUTE)
    try:
        user = await auth_service.authenticate_user(db, payload)
    except auth_service.AuthError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc
    await log_action(db, user_id=user.id, action="login", resource_type="user", resource_id=str(user.id), ip=_client_ip(request))
    return auth_service.issue_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"refresh:{_client_ip(request)}", settings.AUTH_RATE_LIMIT_PER_MINUTE)
    try:
        data = decode_token(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token") from exc
    if data.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong token type")
    import uuid as _uuid

    user_id = _uuid.UUID(data["sub"])
    return TokenResponse(
        access_token=create_token(user_id, "access"),
        refresh_token=create_token(user_id, "refresh"),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(payload: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Integration point: verifying `id_token` against Google's tokeninfo
    endpoint / google-auth library is not performed in this build because no
    GOOGLE_OAUTH_CLIENT_ID is configured. The frontend hides the "Continue
    with Google" button unless GET /api/v1/config reports it as enabled.
    """
    if not settings.GOOGLE_OAUTH_CLIENT_ID:
        raise HTTPException(
            status.HTTP_501_NOT_IMPLEMENTED,
            "Google auth is not configured on this deployment. Set GOOGLE_OAUTH_CLIENT_ID / "
            "GOOGLE_OAUTH_CLIENT_SECRET and implement token verification in this handler.",
        )
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "Google auth verification not yet implemented.")


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user


@router.post("/verify-email", response_model=UserOut)
async def verify_email(payload: VerifyEmailRequest, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"verify-email:{_client_ip(request)}", settings.AUTH_RATE_LIMIT_PER_MINUTE * 3)
    try:
        user = await auth_service.verify_email(db, payload.token)
    except auth_service.AuthError as exc:
        # An already-verified account is not a failure of the person's
        # request, so it gets its own status the UI can treat as a soft success.
        code = status.HTTP_409_CONFLICT if exc.code == "already_verified" else status.HTTP_400_BAD_REQUEST
        raise HTTPException(code, {"message": str(exc), "code": exc.code}) from exc
    await log_action(db, user_id=user.id, action="verify_email", resource_type="user", resource_id=str(user.id), ip=_client_ip(request))
    return user


@router.get("/verification-status", response_model=VerificationStatusOut)
async def verification_status(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return VerificationStatusOut(
        email_verified=user.email_verified,
        masked_email=auth_service.mask_email(user.email),
        resend_available_in=0 if user.email_verified else await auth_service.verification_cooldown_remaining(db, user),
        email_configured=settings.email_live or settings.ENVIRONMENT != "production",
    )


@router.post("/resend-verification", response_model=VerificationSentOut)
async def resend_verification(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    limiter.check(f"resend-verification:{user.id}", settings.EMAIL_RATE_LIMIT_PER_MINUTE)
    limiter.check(f"resend-verification-ip:{_client_ip(request)}", settings.EMAIL_RATE_LIMIT_PER_MINUTE * 4)
    masked = auth_service.mask_email(user.email)
    try:
        await auth_service.resend_verification_email(db, user)
    except auth_service.AuthError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, {"message": str(exc), "code": exc.code}) from exc
    except auth_service.ResendCooldownError as exc:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            {"message": str(exc), "code": "resend_cooldown", "retry_after": exc.retry_after, "masked_email": masked},
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc
    except auth_service.EmailDeliveryError as exc:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            {"message": str(exc), "code": exc.code, "masked_email": masked, "setup_problem": exc.setup_problem},
        ) from exc
    return VerificationSentOut(
        message=f"We asked our email service to send a new link to {masked}. It usually arrives within a minute. Check spam if you don't see it.",
        masked_email=masked,
        accepted=True,
        resend_available_in=int(auth_service.VERIFICATION_RESEND_COOLDOWN.total_seconds()),
    )


@router.post("/change-email", response_model=VerificationSentOut)
async def change_email(
    payload: ChangeEmailRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    limiter.check(f"change-email:{user.id}", settings.EMAIL_RATE_LIMIT_PER_MINUTE)
    try:
        result = await auth_service.change_unverified_email(db, user, payload.new_email, payload.password)
    except auth_service.AuthError as exc:
        code = {
            "wrong_password": status.HTTP_403_FORBIDDEN,  # not 401: the client treats 401 as an expired session
            "already_verified": status.HTTP_409_CONFLICT,
            "same_email": status.HTTP_400_BAD_REQUEST,
            "email_taken": status.HTTP_409_CONFLICT,
        }.get(exc.code, status.HTTP_400_BAD_REQUEST)
        raise HTTPException(code, {"message": str(exc), "code": exc.code}) from exc
    await log_action(db, user_id=user.id, action="change_unverified_email", resource_type="user", resource_id=str(user.id), ip=_client_ip(request))
    masked = auth_service.mask_email(user.email)
    if result.ok:
        return VerificationSentOut(
            message=f"Address updated. We asked our email service to send a verification link to {masked}.",
            masked_email=masked,
            accepted=True,
            resend_available_in=int(auth_service.VERIFICATION_RESEND_COOLDOWN.total_seconds()),
        )
    # The address WAS changed; only the email failed. Say both, and let the
    # screen offer a retry rather than pretending nothing happened.
    return VerificationSentOut(
        message=f"Address updated to {masked}, but we could not send the verification email yet. Use Resend to try again.",
        masked_email=masked,
        accepted=False,
        resend_available_in=0,
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(payload: ForgotPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"forgot-password:{_client_ip(request)}", settings.EMAIL_RATE_LIMIT_PER_MINUTE)
    # Per address, whether or not it has an account, so this can't be used to
    # flood one person's inbox and doesn't reveal anything.
    limiter.check(f"forgot-password-email:{payload.email.lower()}", 3)
    unavailable = {
        "message": (
            "Password reset emails are not working on our side right now. Your account and password are unchanged. "
            f"Please try again later, or write to {settings.EMAIL_REPLY_TO} and we will help."
        ),
        "code": "email_not_configured",
    }
    # Account independent: if email isn't set up at all, say so up front
    # instead of claiming a link is on its way.
    if settings.ENVIRONMENT == "production" and not settings.email_live:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, unavailable)
    outcome = await auth_service.request_password_reset(db, payload.email)
    # A configuration failure (bad key, unverified sender domain) is true for
    # every address, so reporting it does not reveal whether this one exists.
    # Passing outages get the same neutral answer as a success, which words
    # delivery as a request, never a certainty.
    if outcome is not None and not outcome.ok and outcome.is_setup_problem:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, unavailable)
    return MessageResponse(
        message=(
            "If an account exists for that email, we have asked our email service to send a reset link. "
            "It usually arrives within a few minutes. Check your spam folder if you don't see it."
        )
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(payload: ResetPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    limiter.check(f"reset-password:{_client_ip(request)}", settings.AUTH_RATE_LIMIT_PER_MINUTE)
    try:
        await auth_service.reset_password(db, payload.token, payload.new_password)
    except auth_service.AuthError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, {"message": str(exc), "code": exc.code}) from exc
    return MessageResponse(message="Your password has been reset. You can log in now.")
