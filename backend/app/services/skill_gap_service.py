"""
Path-scoped skill-gap snapshot, used by mentor matching (and available for
any future feature that wants "how is this user doing on this specific
path" rather than the global dashboard readiness score).

This is intentionally additive and separate from readiness_service.py:
readiness_service computes a global, cross-path readiness score for the
dashboard (all lessons/projects/quizzes in the DB). This module answers a
narrower question — "for THIS one career path, what does this user's skill
graph look like" — which the global score can't answer, since a user could
be advanced on one path and a total beginner on another.
"""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.progress import UserSkillProgress
from app.models.roadmap import SkillNode
from app.models.user import User

# Skill categories in the rough order a learner encounters them. "career"
# (portfolio/job-prep skills) is deliberately last — those aren't "gaps" for
# a beginner, they're end-of-path concerns.
_CATEGORY_ORDER = {"foundation": 0, "core": 1, "advanced": 2, "career": 3}


class UnknownPathError(ValueError):
    pass


async def get_skill_snapshot(db: AsyncSession, user: User, path_slug: str, max_gaps: int = 3) -> dict:
    path = (await db.execute(select(CareerPath).where(CareerPath.slug == path_slug))).scalar_one_or_none()
    if path is None:
        raise UnknownPathError(f"Unknown career path: {path_slug}")

    nodes = (await db.execute(select(SkillNode).where(SkillNode.path_id == path.id))).scalars().all()
    if not nodes:
        return {"path_slug": path_slug, "level": "Not started", "mastery_avg": 0, "gaps": []}

    mastery_rows = (
        await db.execute(select(UserSkillProgress).where(UserSkillProgress.user_id == user.id))
    ).scalars().all()
    mastery_map: dict[str, int] = {str(m.skill_node_id): m.mastery_pct for m in mastery_rows}

    scored = [
        {
            "key": n.key,
            "label": n.label,
            "category": n.category,
            "mastery_pct": mastery_map.get(str(n.id), 0),
        }
        for n in nodes
    ]

    mastery_avg = round(sum(s["mastery_pct"] for s in scored) / len(scored))
    if mastery_avg < 25:
        level = "Beginner"
    elif mastery_avg < 70:
        level = "Intermediate"
    else:
        level = "Advanced"

    gaps = sorted(
        scored,
        key=lambda s: (s["mastery_pct"], _CATEGORY_ORDER.get(s["category"], 9), s["label"]),
    )[:max_gaps]

    return {"path_slug": path_slug, "level": level, "mastery_avg": mastery_avg, "gaps": gaps}
