import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.portfolio import GeneratePortfolioRequest, PortfolioItemOut, PortfolioItemUpdateRequest
from app.services import case_study_service, portfolio_service
from app.services.career_profile_service import ProfileError

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=list[PortfolioItemOut])
async def list_portfolio(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    items = await portfolio_service.list_portfolio(db, user.id)
    badges = await portfolio_service.badges_for(db, user.id, items)
    return [PortfolioItemOut.model_validate(i).model_copy(update=badges.get(i.id, {})) for i in items]


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


class CaseStudyIn(BaseModel):
    title: str | None = None
    overview: str | None = None
    problem: str | None = None
    solution: str | None = None
    architecture: str | None = None
    challenges: str | None = None
    results: str | None = None
    technologies: list[str] | None = None
    screenshots: list[str] | None = None
    live_demo: str | None = None


def _profile_fail(exc: ProfileError) -> HTTPException:
    return HTTPException(exc.status, exc.message)


@router.get("/{item_id}/case-study")
async def get_case_study(item_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        item = await case_study_service._item(db, user.id, item_id)
    except ProfileError as exc:
        raise _profile_fail(exc) from exc
    return case_study_service.view(item)


@router.post("/{item_id}/case-study/generate")
async def generate_case_study(item_id: uuid.UUID, overwrite: bool = False, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await case_study_service.generate(db, user.id, item_id, overwrite)
    except ProfileError as exc:
        raise _profile_fail(exc) from exc


@router.put("/{item_id}/case-study")
async def save_case_study(item_id: uuid.UUID, payload: CaseStudyIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await case_study_service.update(db, user.id, item_id, payload.model_dump(exclude_unset=True))
    except ProfileError as exc:
        raise _profile_fail(exc) from exc
