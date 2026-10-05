"""Skill Gap Analyzer.

For the career a person is working towards, this lists every skill on that
career's skill graph and says where they stand on it: Strong, Developing or
Missing. A skill's status comes from the lessons and projects that teach it:

* Strong: every lesson and project linked to the skill is finished.
* Developing: some of them are finished, or a project is started.
* Missing: none of it has been touched.

Nothing self-reported changes a status. If you list a skill on your profile
it is shown beside the analysis as "listed by you", because a claim is not
evidence. Each skill links to the lessons and projects that would close the
gap, so the answer to "what do I do about it" is always one click away.

The analyzer is also where the career's employer-expected skills (the plain
language requirements written for each career) are tied back to the skill
graph. A requirement that no lesson or project here teaches yet is reported as
such rather than quietly counted as covered.
"""

from __future__ import annotations

import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.career_profile import UserSkill
from app.models.lab import ProjectLabProgress
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Lesson, Project, RoadmapPhase, SkillNode
from app.models.user import User

CATEGORY_ORDER = {"foundation": 0, "core": 1, "advanced": 2}
# Portfolio and job preparation are measured by their own readiness signals,
# so they are not treated as skills to learn here.
EXCLUDED_CATEGORIES = {"career"}

STATUS_LABEL = {"strong": "Strong", "developing": "Developing", "missing": "Missing"}

_STOP = {
    "with", "and", "the", "for", "from", "using", "basic", "basics", "fundamentals", "common", "working", "work",
    "your", "that", "this", "into", "about", "what", "when", "how", "why", "are", "can", "use", "used", "out",
    "loud", "problem", "explain", "difference", "between", "walk", "through", "you", "would",
}


def tokens(text: str) -> set[str]:
    """Rough word stems, used only to tie loosely worded text to the skill graph."""
    out = set()
    for word in re.findall(r"[a-z0-9+#]+", (text or "").lower()):
        if len(word) < 4 or word in _STOP:
            continue
        out.add(word[:5])
    return out


def _status(done: int, total: int, started_project: bool) -> str:
    if total and done == total:
        return "strong"
    if done > 0 or started_project:
        return "developing"
    return "missing"


async def coverage(db: AsyncSession, user_id: uuid.UUID, path_id: uuid.UUID) -> list[dict]:
    """Per skill: linked lessons and projects with their completion, and the status."""
    nodes = [
        n
        for n in (await db.execute(select(SkillNode).where(SkillNode.path_id == path_id))).scalars().all()
        if n.category not in EXCLUDED_CATEGORIES
    ]
    nodes.sort(key=lambda n: (CATEGORY_ORDER.get(n.category, 9), n.label))
    if not nodes:
        return []
    phases = {p.id: p for p in (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path_id))).scalars().all()}
    node_ids = [n.id for n in nodes]

    lessons = (await db.execute(select(Lesson).where(Lesson.skill_node_id.in_(node_ids)))).scalars().all()
    projects = (await db.execute(select(Project).where(Project.skill_node_id.in_(node_ids)))).scalars().all()
    lessons.sort(key=lambda l: (phases[l.phase_id].order_index if l.phase_id in phases else 99, l.order_index))
    projects.sort(key=lambda p: (p.sequence if p.sequence is not None else 999, phases[p.phase_id].order_index if p.phase_id in phases else 99, p.order_index))

    done_lessons = {
        r
        for r in (
            await db.execute(
                select(UserProgress.lesson_id).where(
                    UserProgress.user_id == user_id, UserProgress.lesson_id.isnot(None), UserProgress.status == ProgressStatus.completed
                )
            )
        ).scalars().all()
    }
    done_projects = {
        r
        for r in (
            await db.execute(
                select(UserProgress.project_id).where(
                    UserProgress.user_id == user_id, UserProgress.project_id.isnot(None), UserProgress.status == ProgressStatus.completed
                )
            )
        ).scalars().all()
    }
    started_projects = {
        r
        for r in (
            await db.execute(select(ProjectLabProgress.project_id).where(ProjectLabProgress.user_id == user_id))
        ).scalars().all()
    }

    rows = []
    for node in nodes:
        ls = [
            {"id": l.id, "title": l.title, "minutes": l.est_minutes, "done": l.id in done_lessons, "href": "/roadmap"}
            for l in lessons
            if l.skill_node_id == node.id
        ]
        ps = []
        for p in projects:
            if p.skill_node_id != node.id:
                continue
            state = "completed" if p.id in done_projects else "started" if p.id in started_projects else "not_started"
            ps.append(
                {
                    "id": p.id,
                    "title": p.title,
                    "state": state,
                    "level": p.level,
                    "lab": bool(p.lab),
                    "href": f"/projects/{p.id}",
                }
            )
        done = sum(1 for l in ls if l["done"]) + sum(1 for p in ps if p["state"] == "completed")
        total = len(ls) + len(ps)
        rows.append(
            {
                "node": node,
                "lessons": ls,
                "projects": ps,
                "done": done,
                "total": total,
                "pct": round(done / total * 100) if total else 0,
                "status": _status(done, total, any(p["state"] == "started" for p in ps)),
            }
        )
    return rows


def skills_pct(rows: list[dict]) -> int:
    """The readiness 'Skills' signal: average completion across the skill graph."""
    if not rows:
        return 0
    return round(sum(r["pct"] for r in rows) / len(rows))


def next_step(row: dict) -> dict | None:
    lesson = next((l for l in row["lessons"] if not l["done"]), None)
    if lesson:
        return {"title": f"Finish the lesson \"{lesson['title']}\"", "href": lesson["href"], "cta": "Open your roadmap", "kind": "lesson"}
    project = next((p for p in row["projects"] if p["state"] != "completed"), None)
    if project:
        verb = "Continue" if project["state"] == "started" else "Start"
        return {"title": f"{verb} the project \"{project['title']}\"", "href": project["href"], "cta": f"{verb} project", "kind": "project"}
    return None


async def analyse(db: AsyncSession, user: User, path: CareerPath) -> dict:
    rows = await coverage(db, user.id, path.id)
    claimed = {s.name_key: s for s in (await db.execute(select(UserSkill).where(UserSkill.user_id == user.id))).scalars().all()}
    claimed_tokens = {k: tokens(k) for k in claimed}

    corpora = []
    label_tokens = []
    for r in rows:
        text = " ".join([r["node"].label, *[l["title"] for l in r["lessons"]], *[p["title"] for p in r["projects"]]])
        corpora.append(tokens(text))
        label_tokens.append(tokens(r["node"].label))

    # Employer expectations (plain language, written per career) tied to the
    # skill graph by shared words. Anything nothing here teaches is reported.
    expectations: dict[int, list[str]] = {i: [] for i in range(len(rows))}
    uncovered: list[str] = []
    for req in path.skills_required or []:
        t = tokens(req)
        # A tie needs the skill's own name in the requirement, or two shared
        # words with its lessons and projects. One shared word is too weak:
        # it ties unrelated skills together.
        scores = [len(t & c) + (2 if t & lt else 0) for c, lt in zip(corpora, label_tokens)]
        best = max(scores) if scores else 0
        if best >= 2 and scores.count(best) == 1:
            expectations[scores.index(best)].append(req)
        else:
            uncovered.append(req)

    questions = list(path.interview_prep or [])
    q_used: set[int] = set()
    skills = []
    for i, r in enumerate(rows):
        node = r["node"]
        node_q = []
        for qi, q in enumerate(questions):
            if len(tokens(q) & corpora[i]) >= 1:
                node_q.append(q)
                q_used.add(qi)
        listed = next((claimed[k] for k, ct in claimed_tokens.items() if ct and ct & tokens(node.label)), None)
        skills.append(
            {
                "key": node.key,
                "label": node.label,
                "category": node.category,
                "status": r["status"],
                "status_label": STATUS_LABEL[r["status"]],
                "pct": r["pct"],
                "done": r["done"],
                "total": r["total"],
                "lessons": r["lessons"],
                "projects": r["projects"],
                "employer_expects": expectations[i],
                "interview_questions": node_q,
                "listed_by_you": listed.name if listed else None,
                "next_step": next_step(r),
            }
        )

    counts = {s: sum(1 for x in skills if x["status"] == s) for s in ("strong", "developing", "missing")}
    gaps = [s for s in skills if s["status"] != "strong"]
    gaps.sort(key=lambda s: (0 if s["status"] == "developing" else 1, CATEGORY_ORDER.get(s["category"], 9)))
    focus = [{"key": s["key"], "label": s["label"], "status": s["status"], "next_step": s["next_step"]} for s in gaps[:3] if s["next_step"]]

    return {
        "has_path": True,
        "career": {"slug": path.slug, "name": path.name},
        "skills": skills,
        "counts": counts,
        "total": len(skills),
        "focus": focus,
        "uncovered_expectations": uncovered,
        "other_interview_questions": [q for qi, q in enumerate(questions) if qi not in q_used],
        "certifications": list(path.certifications or []),
        "resources": list(path.learning_resources or []),
        "how_it_works": (
            "A skill is Strong when every lesson and project that teaches it is finished, Developing when some are, and Missing when none are. "
            "Skills you list yourself never change a status, because nothing checks them."
        ),
    }
