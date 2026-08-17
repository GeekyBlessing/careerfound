"""
Deterministic mentor matching. No LLM call — the ranking and the
human-readable "why this mentor" reason are both built from real,
structured data already in the database (the mentor's own profile fields,
plus the user's real per-path skill snapshot from skill_gap_service).

This is intentionally template-based rather than free-text-generated: the
whole point of "smart mentorship" per the product requirement is that it
reads real progress data, not that it sounds clever. A future pass could
swap the reason-string builder for an LLM call without touching the scoring
logic below.
"""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.marketplace import Mentor
from app.models.user import User
from app.services import marketplace_service, skill_gap_service


def _first_name(display_name: str) -> str:
    return display_name.split(" ")[0] if display_name else display_name


def score_mentor(mentor: Mentor, level: str) -> int:
    score = 50  # baseline: mentor already covers this path
    is_beginner_ish = level in ("Beginner", "Not started")
    if mentor.focus_beginner_friendly and is_beginner_ish:
        score += 25
    if mentor.is_founding_mentor:
        score += 10
    if mentor.is_verified:
        score += 5
    if mentor.years_experience:
        score += min(mentor.years_experience, 10)
    if mentor.rating_count > 0:
        score += round(mentor.rating_avg * 2)
    return max(0, min(100, score))


def build_reason(mentor: Mentor, path_name: str, level: str, gap_labels: list[str]) -> str:
    is_beginner_ish = level in ("Beginner", "Not started")
    name = _first_name(mentor.display_name)

    if mentor.focus_beginner_friendly and is_beginner_ish:
        reason = (
            f"{mentor.display_name} mentors beginners entering {path_name} and can help you "
            "understand what to learn first, how to structure your learning journey, and how to "
            "avoid common beginner mistakes."
        )
        if gap_labels:
            reason += (
                f" Based on your progress so far, your biggest gaps right now are "
                f"{', '.join(gap_labels)} — exactly the kind of thing {name} works through with new mentees."
            )
        return reason

    if mentor.value_proposition:
        return mentor.value_proposition

    reason = f"{mentor.display_name} covers {path_name}"
    if mentor.years_experience:
        reason += f" with {mentor.years_experience} years of experience"
    reason += "."
    return reason


async def recommend_mentors_for_user(
    db: AsyncSession, user: User, path_slug: str, limit: int = 3
) -> dict:
    path = (await db.execute(select(CareerPath).where(CareerPath.slug == path_slug))).scalar_one_or_none()
    path_name = path.name if path else path_slug.replace("-", " ").title()

    snapshot = await skill_gap_service.get_skill_snapshot(db, user, path_slug)
    gap_labels = [g["label"] for g in snapshot["gaps"]]

    mentors = await marketplace_service.list_mentors(db, path_slug, None)
    scored = [
        {
            "mentor": m,
            "score": score_mentor(m, snapshot["level"]),
            "reason": build_reason(m, path_name, snapshot["level"], gap_labels),
        }
        for m in mentors
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"snapshot": snapshot, "matches": scored[:limit]}
