from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.roadmap import Roadmap, RoadmapStatus, SkillEdge, SkillNode
from app.models.progress import UserSkillProgress
from app.models.user import User
from app.schemas.dashboard import DashboardOut, ReadinessScoreOut, SkillGraphOut
from app.services import dashboard_service, readiness_service

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardOut)
async def get_dashboard(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    payload = await dashboard_service.build_dashboard(db, user)
    return payload


@router.get("/dashboard/mission/today")
async def get_today_mission(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    payload = await dashboard_service.build_dashboard(db, user)
    return payload["today_mission"]


@router.get("/skill-graph", response_model=SkillGraphOut)
async def get_skill_graph(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    roadmap_result = await db.execute(
        select(Roadmap).where(Roadmap.user_id == user.id, Roadmap.status == RoadmapStatus.active)
    )
    roadmap = roadmap_result.scalars().first()
    if roadmap is None:
        return SkillGraphOut(nodes=[], edges=[])

    nodes = (await db.execute(select(SkillNode).where(SkillNode.path_id == roadmap.path_id))).scalars().all()
    edges = (await db.execute(select(SkillEdge).where(SkillEdge.path_id == roadmap.path_id))).scalars().all()
    mastery = (
        await db.execute(select(UserSkillProgress).where(UserSkillProgress.user_id == user.id))
    ).scalars().all()
    mastery_map = {str(m.skill_node_id): m.mastery_pct for m in mastery}

    return SkillGraphOut(
        nodes=[
            {"id": n.id, "key": n.key, "label": n.label, "category": n.category, "mastery_pct": mastery_map.get(str(n.id), 0)}
            for n in nodes
        ],
        edges=[{"from_id": e.from_skill_id, "to_id": e.to_skill_id} for e in edges],
    )


@router.get("/readiness-score", response_model=ReadinessScoreOut)
async def get_readiness_score(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    score = await readiness_service.compute_readiness(db, user.id)
    return ReadinessScoreOut(
        overall=score.overall,
        knowledge_pct=score.knowledge_pct,
        projects_pct=score.projects_pct,
        portfolio_pct=score.portfolio_pct,
        interview_pct=score.interview_pct,
        practical_pct=score.practical_pct,
        next_actions=score.next_actions,
    )
