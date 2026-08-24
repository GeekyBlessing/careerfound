from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import EmailPreferencesUpdate, UserOut, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UserUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/me/beginner-mode", response_model=UserOut)
async def toggle_beginner_mode(
    enabled: bool,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.beginner_mode = enabled
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/me/email-preferences", response_model=UserOut)
async def update_email_preferences(
    payload: EmailPreferencesUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Controls optional product email only (career recommendations, roadmap
    nudges, project reminders). Transactional email (verification, password
    reset, booking/payment confirmations) isn't affected by this setting and
    always sends, it's account-critical, not marketing."""
    user.marketing_opt_in = payload.marketing_opt_in
    await db.commit()
    await db.refresh(user)
    return user
