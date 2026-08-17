import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import get_llm_client
from app.models.assessment import Assessment
from app.models.career import CareerPath
from app.schemas.assessment import AssessmentSubmitRequest


async def submit_assessment(db: AsyncSession, user_id: uuid.UUID, payload: AssessmentSubmitRequest) -> Assessment:
    result = await db.execute(select(CareerPath).where(CareerPath.is_active.is_(True)))
    paths = result.scalars().all()
    catalog = [
        {
            "slug": p.slug,
            "name": p.name,
            "summary": p.summary,
            "difficulty": p.difficulty,
            "avg_timeline_weeks": p.avg_timeline_weeks,
            "entry_roles": p.entry_roles,
            "tools": p.tools,
            "remote_potential": p.remote_potential,
            "earning_notes": p.earning_notes,
        }
        for p in paths
    ]

    profile = payload.answers.model_dump()
    llm = get_llm_client()
    ai_result = await llm.analyze_assessment(profile, catalog)

    slug_to_id = {p.slug: p.id for p in paths}
    tiers = {r.tier: r.path_slug for r in ai_result.recommendations}

    assessment = Assessment(
        user_id=user_id,
        answers=profile,
        best_match_path_id=slug_to_id.get(tiers.get("best_match")),
        strong_alt_path_id=slug_to_id.get(tiers.get("strong_alternative")),
        wild_card_path_id=slug_to_id.get(tiers.get("wild_card")),
        recommendations=[r.model_dump() for r in ai_result.recommendations],
        career_dna=ai_result.career_dna.model_dump(),
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment


async def get_latest_assessment(db: AsyncSession, user_id: uuid.UUID) -> Assessment | None:
    result = await db.execute(
        select(Assessment).where(Assessment.user_id == user_id).order_by(Assessment.created_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()
