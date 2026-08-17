from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.career import CareerPath
from app.models.roadmap import Project, RoadmapPhase
from app.schemas.career import CareerPathOut
from app.schemas.roadmap import CareerProjectOut

router = APIRouter(prefix="/careers", tags=["careers"])


@router.get("", response_model=list[CareerPathOut])
async def list_careers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CareerPath).where(CareerPath.is_active.is_(True)).order_by(CareerPath.name))
    return result.scalars().all()


@router.get("/{slug}", response_model=CareerPathOut)
async def get_career(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CareerPath).where(CareerPath.slug == slug))
    path = result.scalar_one_or_none()
    if path is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Career path not found")
    return path


@router.get("/{slug}/projects", response_model=list[CareerProjectOut])
async def list_career_projects(slug: str, db: AsyncSession = Depends(get_db)):
    """Browse every project (Beginner/Intermediate/Expert) authored for a
    career path, independent of any user's roadmap progress. This is what
    powers the public project catalog on a career's detail page — no
    active roadmap or login required to explore what you'd actually build.
    """
    path = (await db.execute(select(CareerPath).where(CareerPath.slug == slug))).scalar_one_or_none()
    if path is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Career path not found")

    phases = (
        (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id).order_by(RoadmapPhase.order_index)))
        .scalars()
        .all()
    )
    if not phases:
        return []
    phase_title_by_id = {phase.id: phase.title for phase in phases}

    projects = (
        (
            await db.execute(
                select(Project).where(Project.phase_id.in_(phase_title_by_id.keys())).order_by(Project.difficulty)
            )
        )
        .scalars()
        .all()
    )
    return [
        CareerProjectOut.model_validate(project).model_copy(update={"phase_title": phase_title_by_id[project.phase_id]})
        for project in projects
    ]
