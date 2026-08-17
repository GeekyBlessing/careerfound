import uuid
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import Role, User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token") from exc

    if payload.get("type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong token type")

    user_id = uuid.UUID(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    user.last_active_at = datetime.now(timezone.utc)
    await db.commit()

    request.state.user_id = str(user.id)
    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != Role.admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user


async def require_mentor(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """Resolves the current user's own Mentor row (mentor-dashboard access).
    403 if this account isn't linked to a Mentor profile — see
    POST /mentors/claim for how that link is established."""
    from app.services import marketplace_service  # local import: avoid a deps<->services import cycle

    if user.role != Role.mentor:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Mentor access required")
    mentor = await marketplace_service.get_mentor_for_user(db, user.id)
    if mentor is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "No mentor profile is linked to this account yet — claim it first via POST /mentors/claim.",
        )
    return mentor
