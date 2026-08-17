import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.career import CareerPath
from app.models.progress import Simulation, UserSimulationAttempt
from app.models.user import User
from app.services.streak_service import touch_streak

router = APIRouter(prefix="/simulations", tags=["simulations"])


@router.get("")
async def list_simulations(path: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(Simulation)
    if path:
        career = (await db.execute(select(CareerPath).where(CareerPath.slug == path))).scalar_one_or_none()
        if career is None:
            return []
        query = query.where(Simulation.path_id == career.id)
    result = await db.execute(query)
    sims = result.scalars().all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "scenario_md": s.scenario_md,
            "options": s.options,
            "difficulty": s.difficulty,
        }
        for s in sims
    ]


@router.post("/{simulation_id}/attempt")
async def attempt_simulation(
    simulation_id: uuid.UUID,
    chosen_option: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sim = (await db.execute(select(Simulation).where(Simulation.id == simulation_id))).scalar_one_or_none()
    if sim is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Simulation not found")
    correct = chosen_option == sim.correct_option
    db.add(UserSimulationAttempt(user_id=user.id, simulation_id=simulation_id, chosen_option=chosen_option, correct=correct))
    if correct:
        await touch_streak(db, user.id)
    await db.commit()
    return {"correct": correct, "explanation_md": sim.explanation_md}
