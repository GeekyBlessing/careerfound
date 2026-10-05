"""Job Description Analyzer.

The person pastes a posting. CareerFound finds the concrete skills the
posting asks for and compares each with the person's own record: finished
projects, finished lessons, skills that are Strong on their skill graph, and
the skills on their published portfolio pieces.

Three principles keep it honest:

* The posting is entered by the user. Nothing here fetches, scrapes or invents
  a listing, and a link is only stored, never opened.
* A skill counts as proven only by work done here. A skill the person listed
  themselves is shown ("listed by you, not backed by work") and does not count.
* "Ready to apply" is a narrow claim, so it is narrowly given: enough of the
  posting is proven, at least one project is finished, and the role is not a
  senior one. Otherwise the answer is "Strengthen your profile first", with the
  specific reasons.

The analysis is deterministic. The same posting and the same record give the
same answer, which is what makes it something to trust and to re-run.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career_profile import JobAnalysis, UserSkill
from app.models.lab import ProjectLabProgress
from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Lesson, Project, RoadmapPhase
from app.models.user import User
from app.services import skill_gap_analyzer
from app.services.career_profile_service import ProfileError, clean_url
from app.services.career_readiness_service import _active_path
from app.services.skill_lexicon import LEXICON

MIN_CHARS = 80
MAX_CHARS = 12000
READY_MATCH = 60
LEARNING_CREDIT = 0.4
REQUIRED_WEIGHT = 2
PREFERRED_WEIGHT = 1

_PREFERRED_HEADING = re.compile(r"nice to have|preferred|bonus|a plus|desirable|good to have|would be great|extra credit", re.I)
_REQUIRED_HEADING = re.compile(r"requirements?|qualifications?|must have|what you.?ll need|you have|about you|who you are|responsibilities|what you.?ll do|skills", re.I)
_SENIOR = re.compile(r"\b(senior|sr\.?|lead|principal|staff|manager|head of|director|architect)\b", re.I)
_YEARS = re.compile(r"(\d{1,2})\s*\+?\s*(?:-\s*\d{1,2}\s*)?(?:years?|yrs?)\b", re.I)

LEXICON_BY_NAME = {name: aliases for name, aliases in LEXICON}


def _pattern(alias: str) -> re.Pattern:
    return re.compile(r"(?<![a-z0-9+#.])" + re.escape(alias.lower()) + r"(?![a-z0-9+#])", re.I)


_ALIAS_PATTERNS = {name: [_pattern(a) for a in sorted(aliases, key=len, reverse=True)] for name, aliases in LEXICON}


def mentions(name: str, text: str) -> int:
    return sum(len(p.findall(text)) for p in _ALIAS_PATTERNS.get(name, []))


def extract_requirements(text: str, title: str = "") -> list[dict]:
    """Find the lexicon terms in the posting and say whether each looks required or preferred."""
    preferred = False
    per_term: dict[str, dict] = {}
    for raw in re.split(r"\n+", text):
        line = raw.strip()
        if not line:
            continue
        looks_like_heading = len(line) <= 70 and (line.endswith(":") or line.isupper() or not re.search(r"[.;,]\s*$", line) and len(line.split()) <= 6)
        if looks_like_heading and _PREFERRED_HEADING.search(line):
            preferred = True
        elif looks_like_heading and _REQUIRED_HEADING.search(line):
            preferred = False
        line_preferred = preferred or bool(_PREFERRED_HEADING.search(line) and not looks_like_heading)
        for name in LEXICON_BY_NAME:
            n = mentions(name, line)
            if not n:
                continue
            entry = per_term.setdefault(name, {"term": name, "mentions": 0, "required_hits": 0, "preferred_hits": 0})
            entry["mentions"] += n
            entry["preferred_hits" if line_preferred else "required_hits"] += 1
    for name in LEXICON_BY_NAME:
        if title and mentions(name, title):
            entry = per_term.setdefault(name, {"term": name, "mentions": 0, "required_hits": 0, "preferred_hits": 0})
            entry["mentions"] += 1
            entry["required_hits"] += 1
    out = []
    for entry in per_term.values():
        entry["level"] = "required" if entry["required_hits"] >= entry["preferred_hits"] else "preferred"
        out.append(entry)
    out.sort(key=lambda e: (e["level"] != "required", -e["mentions"], e["term"]))
    return out


def role_flags(text: str, title: str) -> list[dict]:
    flags = []
    if _SENIOR.search(title or ""):
        flags.append({"key": "senior", "text": "The title suggests a senior or leadership role. CareerFound builds proof for entry level and junior roles, so treat this one as a stretch."})
    years = [int(m.group(1)) for m in _YEARS.finditer(text or "") if 0 < int(m.group(1)) <= 20]
    if years and max(years) >= 3:
        flags.append({"key": "years", "text": f"The posting asks for {max(years)} or more years of experience. Projects can prove skills, but they cannot stand in for years on the job."})
    return flags


# ------------------------------------------------------------------- evidence


async def _evidence(db: AsyncSession, user: User) -> dict:
    done_project_ids = {
        r
        for r in (
            await db.execute(
                select(UserProgress.project_id).where(
                    UserProgress.user_id == user.id, UserProgress.project_id.isnot(None), UserProgress.status == ProgressStatus.completed
                )
            )
        ).scalars().all()
    }
    started_ids = set((await db.execute(select(ProjectLabProgress.project_id).where(ProjectLabProgress.user_id == user.id))).scalars().all())
    done_lesson_ids = {
        r
        for r in (
            await db.execute(
                select(UserProgress.lesson_id).where(
                    UserProgress.user_id == user.id, UserProgress.lesson_id.isnot(None), UserProgress.status == ProgressStatus.completed
                )
            )
        ).scalars().all()
    }
    projects = {p.id: p for p in (await db.execute(select(Project))).scalars().all()}
    lessons = {l.id: l for l in (await db.execute(select(Lesson))).scalars().all()}

    def project_text(p: Project) -> str:
        lab = p.lab or {}
        parts = [p.title, p.teaches or "", " ".join(lab.get("skills", [])), " ".join(t.get("name", "") for t in lab.get("tools", []))]
        return " \n ".join(parts)

    portfolio = (await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == user.id, PortfolioItem.is_published.is_(True)))).scalars().all()
    listed = (await db.execute(select(UserSkill).where(UserSkill.user_id == user.id))).scalars().all()

    strong_nodes: list[str] = []
    developing_nodes: list[str] = []
    path = await _active_path(db, user.id)
    close_pool = {"lessons": [], "projects": []}
    if path is not None:
        rows = await skill_gap_analyzer.coverage(db, user.id, path.id)
        strong_nodes = [r["node"].label for r in rows if r["status"] == "strong"]
        developing_nodes = [r["node"].label for r in rows if r["status"] == "developing"]
        phase_ids = set((await db.execute(select(RoadmapPhase.id).where(RoadmapPhase.path_id == path.id))).scalars().all())
        close_pool["lessons"] = [l for l in lessons.values() if l.phase_id in phase_ids and l.id not in done_lesson_ids]
        close_pool["projects"] = [p for p in projects.values() if p.phase_id in phase_ids and p.id not in done_project_ids]
        close_pool["projects"].sort(key=lambda p: (p.sequence if p.sequence is not None else 999, p.order_index))

    return {
        "completed_projects": [(projects[i].title, project_text(projects[i])) for i in done_project_ids if i in projects],
        "started_projects": [(projects[i].title, project_text(projects[i])) for i in started_ids - done_project_ids if i in projects],
        "done_lessons": [(lessons[i].title, f"{lessons[i].title} {lessons[i].concept_summary}") for i in done_lesson_ids if i in lessons],
        "strong_nodes": strong_nodes,
        "developing_nodes": developing_nodes,
        "portfolio": [(p.title, " ".join(p.skills_demonstrated or [])) for p in portfolio],
        "listed": [s.name for s in listed],
        "close_pool": close_pool,
        "project_text": project_text,
        "has_path": path is not None,
        "completed_count": len(done_project_ids),
        "portfolio_count": len(portfolio),
    }


def _term_evidence(term: str, ev: dict) -> tuple[list[str], list[str]]:
    """(proven evidence, learning evidence) for one term."""
    proven: list[str] = []
    learning: list[str] = []
    for title, text in ev["completed_projects"]:
        if mentions(term, text):
            proven.append(f"Completed project: {title}")
    for title, text in ev["portfolio"]:
        if mentions(term, text):
            proven.append(f"Skill on your published portfolio piece: {title}")
    for label in ev["strong_nodes"]:
        if mentions(term, label):
            proven.append(f"Strong skill on your roadmap: {label}")
    for title, text in ev["started_projects"]:
        if mentions(term, text):
            learning.append(f"Started project: {title}")
    for title, text in ev["done_lessons"]:
        if mentions(term, text):
            learning.append(f"Finished lesson: {title}")
    for label in ev["developing_nodes"]:
        if mentions(term, label):
            learning.append(f"Developing skill on your roadmap: {label}")
    return list(dict.fromkeys(proven)), list(dict.fromkeys(learning))


def _close_with(term: str, ev: dict) -> dict | None:
    for p in ev["close_pool"]["projects"]:
        if mentions(term, ev["project_text"](p)):
            return {"kind": "project", "title": f"Build \"{p.title}\"", "href": f"/projects/{p.id}"}
    for l in ev["close_pool"]["lessons"]:
        if mentions(term, f"{l.title} {l.concept_summary}"):
            return {"kind": "lesson", "title": f"Finish the lesson \"{l.title}\"", "href": "/roadmap"}
    return None


# ------------------------------------------------------------------- analysis


async def analyse_text(db: AsyncSession, user: User, description: str, title: str = "") -> dict:
    ev = await _evidence(db, user)
    reqs = extract_requirements(description, title)
    flags = role_flags(description, title)

    strong, learning, gaps, claimed_only = [], [], [], []
    listed_keys = {s.lower() for s in ev["listed"]}
    weight_total = 0
    earned = 0.0
    required_total = required_proven = 0
    for r in reqs:
        term, level = r["term"], r["level"]
        w = REQUIRED_WEIGHT if level == "required" else PREFERRED_WEIGHT
        proven, learn = _term_evidence(term, ev)
        weight_total += w
        if level == "required":
            required_total += 1
        item = {"skill": term, "requirement": level, "mentions": r["mentions"]}
        if proven:
            earned += w
            required_proven += 1 if level == "required" else 0
            strong.append({**item, "evidence": proven[:3]})
        elif learn:
            earned += w * LEARNING_CREDIT
            learning.append({**item, "evidence": learn[:3], "close_with": _close_with(term, ev)})
        else:
            listed = any(mentions(term, k) for k in listed_keys) or term.lower() in listed_keys
            gap = {**item, "close_with": _close_with(term, ev), "listed_by_you": listed}
            gaps.append(gap)
            if listed:
                claimed_only.append(term)

    recognised = len(reqs)
    match_pct = round(earned / weight_total * 100) if weight_total else 0

    reasons: list[str] = []
    if recognised == 0:
        verdict = "unclear"
        reasons.append("No tools or skills we recognise were found in this text. Paste the full responsibilities and requirements sections.")
    else:
        ok = True
        if match_pct < READY_MATCH:
            ok = False
            reasons.append(f"Only {match_pct}% of the posting is backed by work on CareerFound. {READY_MATCH}% or more is the bar for applying with confidence.")
        if required_total and required_proven * 2 < required_total:
            ok = False
            reasons.append(f"You have proof for {required_proven} of the {required_total} required skills. Fewer than half is too thin.")
        if ev["completed_count"] == 0:
            ok = False
            reasons.append("You have not completed a project yet. Employers screen on work they can open.")
        if any(f["key"] == "senior" for f in flags):
            ok = False
            reasons.append("The role looks senior, which is beyond what your record can show.")
        if ok:
            verdict = "ready"
            reasons.append(f"{match_pct}% of the posting is backed by work you finished here, including {required_proven} of {required_total} required skills.")
        else:
            verdict = "strengthen"

    before: list[dict] = []
    seen = set()
    for g in sorted(gaps + learning, key=lambda x: (x["requirement"] != "required", -x["mentions"])):
        cw = g.get("close_with")
        if cw and cw["href"] not in seen and len(before) < 3:
            seen.add(cw["href"])
            before.append({"title": cw["title"], "href": cw["href"], "why": f"The posting asks for {g['skill']} and you have no finished work that shows it."})
    if ev["completed_count"] == 0 and "/projects" not in seen:
        before.append({"title": "Finish your first project", "href": "/projects", "why": "A finished, published project is the first thing a hiring manager can open."})
    elif ev["portfolio_count"] == 0:
        before.append({"title": "Publish a project to your portfolio", "href": "/portfolio", "why": "Your portfolio is what you send with the application."})
    if not ev["has_path"]:
        before.insert(0, {"title": "Choose a career path", "href": "/onboarding", "why": "Without a roadmap there is no record to compare the posting with."})
    uncovered = [g["skill"] for g in gaps if not g.get("close_with")]

    verdict_label = {"ready": "Ready to apply", "strengthen": "Strengthen your profile first", "unclear": "Not enough to analyse"}[verdict]
    return {
        "recognised": recognised,
        "match_pct": match_pct if recognised else None,
        "verdict": verdict,
        "verdict_label": verdict_label,
        "reasons": reasons,
        "strong_matches": strong,
        "in_progress": learning,
        "gaps": gaps,
        "listed_not_proven": claimed_only,
        "before_applying": before,
        "not_on_your_roadmap": uncovered,
        "flags": flags,
        "method": (
            "Skills are read from the text you pasted and compared with your own record. A skill counts as proven by a finished project, "
            "a published portfolio piece or a Strong skill. Skills you list yourself do not count. This is a comparison with the posting, "
            "not a prediction of whether you will be hired."
        ),
    }


def _out(a: JobAnalysis, full: bool = True) -> dict:
    base = {
        "id": a.id,
        "title": a.title,
        "company": a.company,
        "source_url": a.source_url,
        "match_pct": a.match_pct if (a.result or {}).get("recognised") else None,
        "verdict": a.verdict,
        "verdict_label": (a.result or {}).get("verdict_label", ""),
        "analysed_at": a.analysed_at.isoformat() if a.analysed_at else None,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }
    if full:
        base["description"] = a.description
        base["result"] = a.result
    return base


async def create(db: AsyncSession, user: User, title: str, company: str, source_url: str, description: str) -> dict:
    description = (description or "").strip()
    if len(description) < MIN_CHARS:
        raise ProfileError(f"Paste the job description, at least {MIN_CHARS} characters, so there is enough to analyse.", 422)
    if len(description) > MAX_CHARS:
        raise ProfileError(f"That is longer than {MAX_CHARS} characters. Paste the responsibilities and requirements sections.", 422)
    title = (title or "").strip()[:160]
    result = await analyse_text(db, user, description, title)
    row = JobAnalysis(
        user_id=user.id,
        title=title,
        company=(company or "").strip()[:160],
        source_url=clean_url(source_url, "job link"),
        description=description,
        result=result,
        match_pct=result["match_pct"] or 0,
        verdict=result["verdict"],
        analysed_at=datetime.now(timezone.utc),
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return _out(row)


async def _get(db: AsyncSession, user: User, analysis_id: uuid.UUID) -> JobAnalysis:
    row = (await db.execute(select(JobAnalysis).where(JobAnalysis.id == analysis_id, JobAnalysis.user_id == user.id))).scalar_one_or_none()
    if row is None:
        raise ProfileError("Analysis not found.", 404)
    return row


async def get(db: AsyncSession, user: User, analysis_id: uuid.UUID) -> dict:
    return _out(await _get(db, user, analysis_id))


async def refresh(db: AsyncSession, user: User, analysis_id: uuid.UUID) -> dict:
    """Re-run the same posting against the person's record as it is now."""
    row = await _get(db, user, analysis_id)
    result = await analyse_text(db, user, row.description, row.title)
    row.result = result
    row.match_pct = result["match_pct"] or 0
    row.verdict = result["verdict"]
    row.analysed_at = datetime.now(timezone.utc)
    await db.commit()
    return _out(row)


async def list_all(db: AsyncSession, user: User) -> list[dict]:
    rows = (await db.execute(select(JobAnalysis).where(JobAnalysis.user_id == user.id).order_by(JobAnalysis.created_at.desc()).limit(50))).scalars().all()
    return [_out(r, full=False) for r in rows]


async def delete(db: AsyncSession, user: User, analysis_id: uuid.UUID) -> None:
    row = await _get(db, user, analysis_id)
    await db.delete(row)
    await db.commit()
