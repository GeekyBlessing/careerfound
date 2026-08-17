from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import decode_token, create_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    GoogleAuthRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
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
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
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
