"""Idempotent sync of the Project Lab curricula into the database.

Each lab project either takes over an existing roadmap project (matched first
by slug, then by the legacy title inside the named phase) so progress and
portfolio items already pointing at it survive, or is created in the right
phase. Nothing is ever deleted here: a legacy project that no lab project
claims simply stays as it was.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.roadmap import Project, RoadmapPhase, SkillNode
from app.seed.lab import LAB_CURRICULA
from app.seed.lab.universal import LEVEL_DIFFICULTY

# Keys of the lab dictionary that are stored in Project.lab. Everything else
# in a curriculum entry is a first class column.
LAB_KEYS = (
    "summary", "overview", "skills", "tools", "deliverable", "requirements", "milestones",
    "documentation", "security_notes", "interview", "criteria", "readme", "recommended_before", "cv_bullet",
)


def lab_payload(entry: dict) -> dict:
    return {k: entry[k] for k in LAB_KEYS}


def legacy_columns(entry: dict, titles: dict[str, str]) -> dict:
    """The older Project columns, filled so every pre lab surface keeps working."""
    prereq = [titles[s] for s in entry["recommended_before"] if s in titles]
    return {
        "teaches": ", ".join(entry["skills"]),
        "prerequisites": prereq,
        "expected_output": entry["deliverable"],
        "steps": [m["title"] for m in entry["milestones"]],
        "hints": entry["hints"],
        "common_mistakes": entry["common_mistakes"],
        "difficulty": LEVEL_DIFFICULTY[entry["level"]],
    }


async def sync_lab_curriculum(db: AsyncSession, career_slug: str, entries: list[dict], phase_skill_keys: dict[str, str]) -> int:
    path = (await db.execute(select(CareerPath).where(CareerPath.slug == career_slug))).scalar_one_or_none()
    if path is None:
        return 0
    phases = {
        p.title: p for p in (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id))).scalars().all()
    }
    nodes = {n.key: n for n in (await db.execute(select(SkillNode).where(SkillNode.path_id == path.id))).scalars().all()}
    titles = {e["slug"]: e["title"] for e in entries}

    touched = 0
    claimed: set = set()
    per_phase_count: dict[str, int] = {}
    for sequence, entry in enumerate(entries):
        phase = phases.get(entry["phase"])
        if phase is None:
            continue
        in_phase = (await db.execute(select(Project).where(Project.phase_id == phase.id))).scalars().all()
        project = next((p for p in in_phase if p.slug == entry["slug"]), None)
        if project is None and entry.get("legacy_title"):
            project = next((p for p in in_phase if p.title == entry["legacy_title"] and p.slug is None and p.id not in claimed), None)
        node = nodes.get(phase_skill_keys.get(entry["phase"], ""))
        index = per_phase_count.get(phase.title, 0)
        per_phase_count[phase.title] = index + 1
        cols = legacy_columns(entry, titles)
        if project is None:
            project = Project(phase_id=phase.id, order_index=index, title=entry["title"], skill_node_id=node.id if node else None, **cols)
            db.add(project)
        else:
            project.title = entry["title"]
            project.order_index = index
            if node:
                project.skill_node_id = node.id
            for field, value in cols.items():
                setattr(project, field, value)
        project.slug = entry["slug"]
        project.level = entry["level"]
        project.sequence = sequence
        project.est_hours = entry["est_hours"]
        project.kind = entry["kind"]
        project.lab = lab_payload(entry)
        await db.flush()
        claimed.add(project.id)
        touched += 1
    await db.commit()
    return touched


async def sync_all_lab_curricula(db: AsyncSession) -> int:
    from app.seed.seed_data import ROADMAP_CONTENT

    total = 0
    for slug, entries in LAB_CURRICULA.items():
        content = ROADMAP_CONTENT.get(slug, {})
        phase_skill_keys = {p["title"]: p.get("skill_key", "") for p in content.get("phases", [])}
        total += await sync_lab_curriculum(db, slug, entries, phase_skill_keys)
    return total
