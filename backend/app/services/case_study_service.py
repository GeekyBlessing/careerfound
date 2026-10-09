"""Project to portfolio: an editable case study for each portfolio piece.

The draft is assembled from things that are really there: the project's
authored description of what is being built (marked as a template to rewrite),
the technologies the project uses, and, for the "challenges" section, the
person's own written interview answer. It never invents results. Anything that
only the person can know, such as results and screenshots, stays empty and is
listed as needing input, so the page never shows made up outcomes.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lab import ProjectLabProgress
from app.models.portfolio import PortfolioItem
from app.models.roadmap import Project
from app.seed.lab.universal import INTERVIEW_MIN_CHARS
from app.services.career_profile_service import ProfileError, clean_url

TEXT_FIELDS = {"title": 200, "overview": 1200, "problem": 1200, "solution": 1500, "architecture": 1500, "challenges": 1500, "results": 1500}
MAX_TECH = 20
MAX_SHOTS = 6
HARDEST_PART_KEY = "u4"  # "What was the hardest part?" in the universal interview set
REQUIRED_FOR_PUBLISH = ("overview", "problem", "solution")


async def _item(db: AsyncSession, user_id: uuid.UUID, item_id: uuid.UUID) -> PortfolioItem:
    row = (await db.execute(select(PortfolioItem).where(PortfolioItem.id == item_id, PortfolioItem.user_id == user_id))).scalar_one_or_none()
    if row is None:
        raise ProfileError("Portfolio item not found.", 404)
    return row


def _empty() -> dict:
    return {**{k: "" for k in TEXT_FIELDS}, "technologies": [], "screenshots": []}


def view(item: PortfolioItem) -> dict:
    cs = {**_empty(), **(item.case_study or {})}
    needs = [k for k in ("challenges", "results") if not (cs.get(k) or "").strip()]
    if not cs["screenshots"]:
        needs.append("screenshots")
    return {
        "case_study": {k: cs.get(k, "") for k in TEXT_FIELDS} | {"technologies": cs["technologies"], "screenshots": cs["screenshots"]},
        "github": item.repo_url,
        "live_demo": item.live_url,
        "status": (item.case_study or {}).get("status", "none"),
        "generated_at": (item.case_study or {}).get("generated_at"),
        "needs_input": needs if (item.case_study or {}) else [],
        "publishable": all((cs.get(k) or "").strip() for k in REQUIRED_FOR_PUBLISH),
    }


async def generate(db: AsyncSession, user_id: uuid.UUID, item_id: uuid.UUID, overwrite: bool = False) -> dict:
    item = await _item(db, user_id, item_id)
    project = (await db.execute(select(Project).where(Project.id == item.project_id))).scalar_one_or_none()
    lab = (project.lab or {}) if project else {}
    readme = lab.get("readme", {})

    draft = _empty()
    draft["title"] = item.title
    sources: dict[str, str] = {}
    if lab:
        for key in ("overview", "problem", "solution", "architecture"):
            draft[key] = readme.get(key, "")
            sources[key] = "template"
        draft["technologies"] = [t["name"] for t in lab.get("tools", [])][:MAX_TECH]
        progress = (
            await db.execute(select(ProjectLabProgress).where(ProjectLabProgress.user_id == user_id, ProjectLabProgress.project_id == item.project_id))
        ).scalar_one_or_none()
        answer = ((progress.interview_answers or {}).get(HARDEST_PART_KEY) or "").strip() if progress else ""
        if len(answer) >= INTERVIEW_MIN_CHARS:
            draft["challenges"] = answer
            sources["challenges"] = "your_interview_answer"
    else:
        draft["overview"] = item.project_description
        draft["technologies"] = list(item.skills_demonstrated or [])[:MAX_TECH]
        sources["overview"] = "your_portfolio_description"

    current = dict(item.case_study or {})
    merged = _empty()
    for key in list(TEXT_FIELDS) + ["technologies", "screenshots"]:
        mine = current.get(key)
        keep = bool(mine) and not overwrite
        merged[key] = mine if keep else draft[key]
    merged["screenshots"] = current.get("screenshots", []) if not overwrite else []
    merged["status"] = "draft"
    merged["generated_at"] = datetime.now(timezone.utc).isoformat()
    merged["sources"] = sources
    item.case_study = merged
    await db.commit()
    await db.refresh(item)
    out = view(item)
    out["sources"] = sources
    return out


def _text(value, limit: int, field: str) -> str:
    value = (value or "").strip() if isinstance(value, str) else ""
    if len(value) > limit:
        raise ProfileError(f"The {field} section is longer than {limit} characters.", 422)
    return value


async def update(db: AsyncSession, user_id: uuid.UUID, item_id: uuid.UUID, payload: dict) -> dict:
    item = await _item(db, user_id, item_id)
    cs = {**_empty(), **(item.case_study or {})}
    for key, limit in TEXT_FIELDS.items():
        if key in payload:
            cs[key] = _text(payload[key], limit, key)
    if "technologies" in payload:
        techs = [re.sub(r"\s+", " ", str(t)).strip()[:60] for t in (payload["technologies"] or []) if str(t).strip()]
        if len(techs) > MAX_TECH:
            raise ProfileError(f"List up to {MAX_TECH} technologies.", 422)
        cs["technologies"] = list(dict.fromkeys(techs))
    if "screenshots" in payload:
        shots = [clean_url(str(u), "screenshot link") for u in (payload["screenshots"] or []) if str(u).strip()]
        if len(shots) > MAX_SHOTS:
            raise ProfileError(f"Add up to {MAX_SHOTS} screenshots.", 422)
        cs["screenshots"] = shots
    if "live_demo" in payload:
        item.live_url = clean_url(payload["live_demo"] or "", "live demo link")
    cs["status"] = "edited"
    cs["generated_at"] = (item.case_study or {}).get("generated_at")
    cs["sources"] = (item.case_study or {}).get("sources", {})
    item.case_study = cs
    await db.commit()
    await db.refresh(item)
    return view(item)
