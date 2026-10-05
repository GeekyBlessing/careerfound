"""CareerFound 2.0 endpoints that connect the journey: readiness, skill gap,
job analysis, public profile. Grouped under /career so the learning, lab and
portfolio routers they read from stay unchanged."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.services import career_profile_service, career_readiness_service, job_analyzer_service, skill_gap_analyzer
from app.services.career_profile_service import ProfileError
from app.services.career_readiness_service import _active_path

router = APIRouter(prefix="/career", tags=["career"])


def _fail(exc: ProfileError) -> HTTPException:
    return HTTPException(exc.status, exc.message)


@router.get("/readiness")
async def readiness(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await career_readiness_service.compute(db, user)


@router.get("/skill-gap")
async def skill_gap(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    path = await _active_path(db, user.id)
    if path is None:
        return {"has_path": False}
    data = await skill_gap_analyzer.analyse(db, user, path)
    data["listed_skills"] = [career_profile_service.skill_out(s) for s in await career_profile_service.list_skills(db, user.id)]
    return data


# --------------------------------------------------- self-reported skills and certifications


class SkillIn(BaseModel):
    name: str = Field(max_length=80)
    level: str = "learning"


class CertificationIn(BaseModel):
    name: str = Field(max_length=160)
    issuer: str = Field(default="", max_length=120)
    status: str = "earned"
    year: int | None = None
    credential_url: str = Field(default="", max_length=300)


@router.get("/skills")
async def list_skills(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return [career_profile_service.skill_out(s) for s in await career_profile_service.list_skills(db, user.id)]


@router.post("/skills", status_code=status.HTTP_201_CREATED)
async def add_skill(payload: SkillIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return career_profile_service.skill_out(await career_profile_service.add_skill(db, user.id, payload.name, payload.level))
    except ProfileError as exc:
        raise _fail(exc) from exc


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_skill(skill_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        await career_profile_service.remove_skill(db, user.id, skill_id)
    except ProfileError as exc:
        raise _fail(exc) from exc


@router.get("/certifications")
async def list_certifications(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return [career_profile_service.cert_out(c) for c in await career_profile_service.list_certifications(db, user.id)]


@router.post("/certifications", status_code=status.HTTP_201_CREATED)
async def add_certification(payload: CertificationIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return career_profile_service.cert_out(
            await career_profile_service.add_certification(db, user.id, payload.name, payload.issuer, payload.status, payload.year, payload.credential_url)
        )
    except ProfileError as exc:
        raise _fail(exc) from exc


@router.delete("/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_certification(cert_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        await career_profile_service.remove_certification(db, user.id, cert_id)
    except ProfileError as exc:
        raise _fail(exc) from exc


# ------------------------------------------------------------------ job description analyzer


class JobAnalysisIn(BaseModel):
    title: str = Field(default="", max_length=160)
    company: str = Field(default="", max_length=160)
    source_url: str = Field(default="", max_length=400)
    description: str = Field(max_length=20000)


@router.get("/job-analyses")
async def list_job_analyses(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await job_analyzer_service.list_all(db, user)


@router.post("/job-analyses", status_code=status.HTTP_201_CREATED)
async def create_job_analysis(payload: JobAnalysisIn, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    limiter.check(f"job_analysis:{user.id}", settings.AI_RATE_LIMIT_PER_MINUTE)
    try:
        return await job_analyzer_service.create(db, user, payload.title, payload.company, payload.source_url, payload.description)
    except ProfileError as exc:
        raise _fail(exc) from exc


@router.get("/job-analyses/{analysis_id}")
async def get_job_analysis(analysis_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await job_analyzer_service.get(db, user, analysis_id)
    except ProfileError as exc:
        raise _fail(exc) from exc


@router.post("/job-analyses/{analysis_id}/refresh")
async def refresh_job_analysis(analysis_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        return await job_analyzer_service.refresh(db, user, analysis_id)
    except ProfileError as exc:
        raise _fail(exc) from exc


@router.delete("/job-analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_analysis(analysis_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        await job_analyzer_service.delete(db, user, analysis_id)
    except ProfileError as exc:
        raise _fail(exc) from exc
