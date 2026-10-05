"""Idempotent sync of the career catalogue into an already-seeded database.

The original seed only created missing rows and backfilled empty fields, so
edits to existing careers (names, categories, relationships, roadmap
projects) never reached a database that had already been seeded. This module
makes the code in app/seed authoritative for catalogue content (nothing in the
product edits CareerPath rows) while never deleting anything a user's progress
or portfolio points at:

  * legacy slugs are renamed in place, so ids (and everything referencing
    them) are preserved;
  * career fields are overwritten from CAREER_PATHS;
  * light roadmap content (skills, phases, projects) is updated in place by
    skill key / phase title / project title, new items are added, and an
    obsolete project is removed only when no progress row and no portfolio
    item references it.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.marketplace import Mentor, MentorApplication
from app.models.portfolio import PortfolioItem
from app.models.progress import UserProgress
from app.models.roadmap import Project, RoadmapPhase, SkillEdge, SkillNode
from app.services.career_taxonomy import LEGACY_SLUG_REDIRECTS, canonical_slug

PROJECT_FIELDS = ("teaches", "prerequisites", "expected_output", "steps", "hints", "common_mistakes", "difficulty")


async def rename_legacy_paths(db: AsyncSession, catalogue: list[dict]) -> None:
    """Rename rows still stored under a legacy slug (ids are untouched)."""
    names = {c["slug"]: c["name"] for c in catalogue}
    rows = {p.slug: p for p in (await db.execute(select(CareerPath))).scalars().all()}
    changed = False
    for old, new in LEGACY_SLUG_REDIRECTS.items():
        if old in rows and new not in rows and new in names:
            rows[old].slug = new
            rows[old].name = names[new]
            changed = True
    if changed:
        await db.commit()


async def sync_career_fields(db: AsyncSession, catalogue: list[dict]) -> None:
    rows = {p.slug: p for p in (await db.execute(select(CareerPath))).scalars().all()}
    changed = False
    for data in catalogue:
        path = rows.get(data["slug"])
        if path is None:
            continue
        for field, value in data.items():
            if field == "slug":
                continue
            if getattr(path, field) != value:
                setattr(path, field, value)
                changed = True
    if changed:
        await db.commit()


async def normalize_mentor_tags(db: AsyncSession) -> None:
    """Rewrite legacy career slugs in mentor and application tags."""
    changed = False
    for model in (Mentor, MentorApplication):
        for row in (await db.execute(select(model))).scalars().all():
            tags = list(row.paths or [])
            updated: list[str] = []
            for tag in tags:
                tag = canonical_slug(tag)
                if tag not in updated:
                    updated.append(tag)
            if updated != tags:
                row.paths = updated
                changed = True
    if changed:
        await db.commit()


async def _project_is_referenced(db: AsyncSession, project_id: uuid.UUID) -> bool:
    if (await db.execute(select(UserProgress.id).where(UserProgress.project_id == project_id).limit(1))).first():
        return True
    if (await db.execute(select(PortfolioItem.id).where(PortfolioItem.project_id == project_id).limit(1))).first():
        return True
    return False


async def sync_light_roadmap_content(db: AsyncSession, path: CareerPath, content: dict) -> None:
    """Bring a path's skills, phases and projects in line with `content`."""
    nodes = {n.key: n for n in (await db.execute(select(SkillNode).where(SkillNode.path_id == path.id))).scalars().all()}
    for skill in content["skills"]:
        node = nodes.get(skill["key"])
        if node is None:
            node = SkillNode(path_id=path.id, key=skill["key"], label=skill["label"], category=skill["category"])
            db.add(node)
            await db.flush()
            nodes[skill["key"]] = node
        else:
            node.label = skill["label"]
            node.category = skill["category"]

    existing_edges = {
        (e.from_skill_id, e.to_skill_id)
        for e in (await db.execute(select(SkillEdge).where(SkillEdge.path_id == path.id))).scalars().all()
    }
    for from_key, to_key in content["skill_edges"]:
        pair = (nodes[from_key].id, nodes[to_key].id)
        if pair not in existing_edges:
            db.add(SkillEdge(path_id=path.id, from_skill_id=pair[0], to_skill_id=pair[1]))

    phases = {
        p.title: p
        for p in (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id))).scalars().all()
    }
    for phase_idx, phase_data in enumerate(content["phases"]):
        phase = phases.get(phase_data["title"])
        if phase is None:
            phase = RoadmapPhase(
                path_id=path.id, order_index=phase_idx, title=phase_data["title"],
                summary=phase_data["summary"], unlocks_at_skill_pct=0,
            )
            db.add(phase)
            await db.flush()
        else:
            phase.order_index = phase_idx
            phase.summary = phase_data["summary"]

        skill_id = nodes[phase_data["skill_key"]].id if phase_data.get("skill_key") in nodes else None
        projects = {
            p.title: p for p in (await db.execute(select(Project).where(Project.phase_id == phase.id))).scalars().all()
        }
        wanted_titles = set()
        for proj_idx, proj_data in enumerate(phase_data.get("projects", [])):
            wanted_titles.add(proj_data["title"])
            project = projects.get(proj_data["title"])
            if project is None:
                project = Project(phase_id=phase.id, order_index=proj_idx, title=proj_data["title"], skill_node_id=skill_id,
                                  **{f: proj_data[f] for f in PROJECT_FIELDS})
                db.add(project)
            else:
                project.order_index = proj_idx
                project.skill_node_id = skill_id
                for f in PROJECT_FIELDS:
                    setattr(project, f, proj_data[f])

        for title, project in projects.items():
            if title not in wanted_titles and not await _project_is_referenced(db, project.id):
                await db.delete(project)
    await db.commit()
