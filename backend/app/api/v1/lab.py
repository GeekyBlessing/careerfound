import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.lab import ChecklistUpdate, InterviewUpdate, MilestoneUpdate, RepositoryUpdate, ReviewSubmission
from app.services import lab_service
from app.services.lab_service import LabError

router = APIRouter(prefix="/lab", tags=["project-lab"])


def _fail(exc: LabError) -> HTTPException:
    return HTTPException(exc.status, exc.message)


@router.get("/overview")
async def overview(career: str | None = Query(default=None, max_length=80), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.overview(db, user, career)
    except LabError as exc:
        raise _fail(exc) from exc


@router.get("/careers")
async def careers(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await lab_service.available_careers(db)


@router.get("/careers/{slug}")
async def career_curriculum(slug: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.career_curriculum(db, user, slug)
    except LabError as exc:
        raise _fail(exc) from exc


@router.get("/projects/{project_id}")
async def project_detail(project_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.project_detail(db, user, project_id)
    except LabError as exc:
        raise _fail(exc) from exc


@router.post("/projects/{project_id}/start")
async def start(project_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.start(db, user, project_id)
    except LabError as exc:
        raise _fail(exc) from exc


@router.put("/projects/{project_id}/milestones/{key}")
async def milestone(project_id: uuid.UUID, key: str, payload: MilestoneUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.set_milestone(db, user, project_id, key, payload.done)
    except LabError as exc:
        raise _fail(exc) from exc


@router.put("/projects/{project_id}/checklist")
async def checklist(project_id: uuid.UUID, payload: ChecklistUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.set_checklist(db, user, project_id, payload.items)
    except LabError as exc:
        raise _fail(exc) from exc


@router.put("/projects/{project_id}/repository")
async def repository(project_id: uuid.UUID, payload: RepositoryUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.set_repository(db, user, project_id, payload.url)
    except LabError as exc:
        raise _fail(exc) from exc


@router.post("/projects/{project_id}/repository/check")
async def repository_check(project_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    limiter.check(f"lab_repo_check:{user.id}", 12)
    try:
        return await lab_service.check_repository(db, user, project_id)
    except LabError as exc:
        raise _fail(exc) from exc


@router.put("/projects/{project_id}/interview")
async def interview(project_id: uuid.UUID, payload: InterviewUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.set_interview(db, user, project_id, payload.answers)
    except LabError as exc:
        raise _fail(exc) from exc


@router.post("/projects/{project_id}/complete")
async def complete(project_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.complete(db, user, project_id)
    except LabError as exc:
        raise _fail(exc) from exc


@router.post("/projects/{project_id}/portfolio")
async def portfolio(project_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.add_to_portfolio(db, user, project_id)
    except LabError as exc:
        raise _fail(exc) from exc


@router.post("/projects/{project_id}/submit-review")
async def submit_review(project_id: uuid.UUID, payload: ReviewSubmission, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await lab_service.submit_for_review(db, user, project_id, payload.note)
    except LabError as exc:
        raise _fail(exc) from exc
