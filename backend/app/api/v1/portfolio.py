import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.portfolio import GeneratePortfolioRequest, PortfolioItemOut, PortfolioItemUpdateRequest
from app.services import portfolio_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=list[PortfolioItemOut])
async def list_portfolio(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await portfolio_service.list_portfolio(db, user.id)


@router.post("/generate", response_model=PortfolioItemOut, status_code=status.HTTP_201_CREATED)
async def generate_portfolio(
    payload: GeneratePortfolioRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    limiter.check(f"portfolio_gen:{user.id}", settings.AI_RATE_LIMIT_PER_MINUTE)
    try:
        item = await portfolio_service.generate_portfolio_item(db, user, payload.project_id, payload.submission_text)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    return item


@router.patch("/{item_id}", response_model=PortfolioItemOut)
async def update_portfolio(
    item_id: uuid.UUID,
    payload: PortfolioItemUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        item = await portfolio_service.update_portfolio_item(db, user.id, item_id, payload.model_dump(exclude_unset=True))
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return item
