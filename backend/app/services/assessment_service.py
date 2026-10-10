import uuid


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import get_llm_client
from app.models.assessment import Assessment
from app.models.career import CareerPath
from app.models.roadmap import Project, RoadmapPhase
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
            "category": p.category,
            "skills_required": p.skills_required,
        }
        for p in paths
    ]

    profile = payload.answers.model_dump()
    llm = get_llm_client()
    ai_result = await llm.analyze_assessment(profile, catalog)
    ai_result = await _attach_catalogue_facts(db, ai_result, paths)

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


_DIFFICULTY = {1: "Very beginner-friendly", 2: "Beginner-friendly", 3: "Moderate", 4: "Challenging", 5: "Advanced"}


def _first_sentence(text: str, limit: int = 220) -> str:
    text = " ".join((text or "").split())
    cut = text.find(". ")
    first = text if cut == -1 else text[: cut + 1]
    return first if len(first) <= limit else first[: limit - 1].rstrip() + "..."


async def _attach_catalogue_facts(db: AsyncSession, ai_result, paths):
    """Replace whatever the provider guessed about projects and roadmap steps
    with what is actually in the catalogue: the career's first roadmap phase,
    and the easiest project in it (ties go to the earlier phase). Provider
    output never decides these, so a result cannot name a project that does
    not exist or link to a page that is not there."""
    by_slug = {p.slug: p for p in paths}
    recs = []
    for rec in ai_result.recommendations:
        path = by_slug.get(rec.path_slug)
        if path is None:
            recs.append(rec)
            continue
        phases = (
            (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id).order_by(RoadmapPhase.order_index)))
            .scalars()
            .all()
        )
        update: dict = {}
        if phases:
            first = phases[0]
            update["first_phase"] = {"title": first.title, "summary": _first_sentence(first.summary)}
            update["recommended_next_step"] = f"Start with {first.title}. {_first_sentence(first.summary)}"
            phase_ids = [ph.id for ph in phases]
            order = {ph.id: ph.order_index for ph in phases}
            projects = (await db.execute(select(Project).where(Project.phase_id.in_(phase_ids)))).scalars().all()
            if projects:
                project = min(projects, key=lambda pr: (pr.difficulty, order.get(pr.phase_id, 0), pr.order_index))
                update["first_project"] = {
                    "id": str(project.id),
                    "title": project.title,
                    "teaches": _first_sentence(project.teaches),
                    "difficulty": project.difficulty,
                    "difficulty_label": _DIFFICULTY.get(project.difficulty, ""),
                }
                update["example_projects"] = [project.title]
        recs.append(rec.model_copy(update=update))
    return ai_result.model_copy(update={"recommendations": recs})
