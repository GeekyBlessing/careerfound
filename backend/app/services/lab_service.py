"""Project Lab logic: stage derivation, evidence updates, completion rules.

The central rule is that a stage is never a flag someone sets. Every stage is
computed from evidence stored in ProjectLabProgress (milestones ticked,
checklist items confirmed, a repository that GitHub reports as public with a
README and real commits, interview answers that were actually written) and
from the person's portfolio entry. CareerFound confirms that evidence
exists. It does not run, test or grade anyone's code, and nothing in this
module says otherwise.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.lab import ProjectLabProgress
from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Project, Roadmap, RoadmapPhase, RoadmapStatus
from app.models.user import User
from app.seed.lab.universal import (
    CASE_STUDY_PUBLISH_STEPS,
    GITHUB_CHECKLIST,
    INTERVIEW_MIN_CHARS,
    INTERVIEW_MIN_UNIVERSAL,
    LEVEL_BLURBS,
    LEVEL_LABELS,
    LEVELS,
    PUBLISH_STEPS,
    README_SECTIONS,
    SECURITY_CHECKLIST,
    SECURITY_GUIDANCE,
    STAGES,
    UNIVERSAL_INTERVIEW,
)
from app.services import case_study_service, portfolio_service, repo_check, roadmap_service
from app.services.verification import verification as compute_verification

STAGE_ORDER = [key for key, _, _ in STAGES]
STAGE_LABEL = {key: label for key, label, _ in STAGES}
EVIDENCE_NOTE = (
    "CareerFound checks that your evidence exists: ticked milestones, a public repository with a README and real commits, "
    "and your own written answers. It does not run, test or grade your code."
)
MAX_ANSWER_CHARS = 2000
UNIVERSAL_KEYS = [f"u{i}" for i in range(1, len(UNIVERSAL_INTERVIEW) + 1)]
GH_KEYS = {k for k, _ in GITHUB_CHECKLIST}
SEC_KEYS = {k for k, _ in SECURITY_CHECKLIST}
# Checklist items the repository check can confirm on its own.
VERIFIED_BY_CHECK = {
    "gh.repo_created": "reachable",
    "gh.readme_exists": "readme",
    "gh.public": "public",
    "gh.commits": "commits",
    "gh.gitignore": "gitignore",
    "sec.env_excluded": "no_env_committed",
}


class LabError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message = message
        self.status = status


# --------------------------------------------------------------------- loading


async def _project(db: AsyncSession, project_id: uuid.UUID) -> Project:
    project = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if project is None or not project.lab:
        raise LabError("Project not found.", 404)
    return project


async def _progress(db: AsyncSession, user_id: uuid.UUID, project_id: uuid.UUID) -> ProjectLabProgress | None:
    return (
        await db.execute(
            select(ProjectLabProgress).where(ProjectLabProgress.user_id == user_id, ProjectLabProgress.project_id == project_id)
        )
    ).scalar_one_or_none()


async def _item(db: AsyncSession, user_id: uuid.UUID, project_id: uuid.UUID) -> PortfolioItem | None:
    return (
        await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == user_id, PortfolioItem.project_id == project_id))
    ).scalar_one_or_none()


async def _legacy_done(db: AsyncSession, user_id: uuid.UUID, project_id: uuid.UUID) -> bool:
    row = (
        await db.execute(select(UserProgress).where(UserProgress.user_id == user_id, UserProgress.project_id == project_id))
    ).scalar_one_or_none()
    return bool(row and row.status == ProgressStatus.completed)


async def _career_of(db: AsyncSession, project: Project) -> CareerPath:
    phase = (await db.execute(select(RoadmapPhase).where(RoadmapPhase.id == project.phase_id))).scalar_one()
    return (await db.execute(select(CareerPath).where(CareerPath.id == phase.path_id))).scalar_one()


async def _career_projects(db: AsyncSession, path_id: uuid.UUID) -> list[Project]:
    rows = (
        await db.execute(
            select(Project).join(RoadmapPhase, RoadmapPhase.id == Project.phase_id).where(RoadmapPhase.path_id == path_id, Project.slug.isnot(None), Project.lab.isnot(None))
        )
    ).scalars().all()
    return sorted(rows, key=lambda p: (p.sequence if p.sequence is not None else 999, p.title))


# ------------------------------------------------------------------ derivation


def _interview_state(project: Project, progress: ProjectLabProgress | None) -> dict:
    answers = dict(progress.interview_answers or {}) if progress else {}
    tech_keys = [q["key"] for q in project.lab["interview"]]

    def good(key: str) -> bool:
        return len((answers.get(key) or "").strip()) >= INTERVIEW_MIN_CHARS

    tech_done = sum(1 for k in tech_keys if good(k))
    uni_done = sum(1 for k in UNIVERSAL_KEYS if good(k))
    return {
        "technical_answered": tech_done,
        "technical_total": len(tech_keys),
        "universal_answered": uni_done,
        "universal_required": INTERVIEW_MIN_UNIVERSAL,
        "ready": tech_done == len(tech_keys) and uni_done >= INTERVIEW_MIN_UNIVERSAL,
    }


def derive(project: Project, progress: ProjectLabProgress | None, item: PortfolioItem | None, legacy_done: bool) -> dict:
    lab = project.lab
    milestone_keys = [m["key"] for m in lab["milestones"]]
    criteria_keys = [c["key"] for c in lab["criteria"]]
    done = [k for k in (progress.milestones if progress else []) if k in milestone_keys]
    checklist = dict(progress.checklist or {}) if progress else {}
    criteria_ok = all(checklist.get(k) for k in criteria_keys)
    interview = _interview_state(project, progress)

    credited_by_history = legacy_done and progress is None
    started = progress is not None or credited_by_history
    completed = bool(progress and progress.completed_at) or credited_by_history
    repo_url = progress.repo_url if progress else ""
    check = dict(progress.repo_check or {}) if progress else {}
    repo_ok = bool(check.get("passed") and repo_url and check.get("url") == repo_url)
    published = completed and repo_ok
    flags = {
        "started": started,
        "in_progress": len(done) >= 1 or completed,
        "completed": completed,
        "published": published,
        "portfolio_ready": bool(published and item and item.is_published),
        "interview_ready": interview["ready"],
    }
    stage = None
    for key in STAGE_ORDER:
        if flags[key]:
            stage = key
        else:
            break
    missing: list[str] = []
    if len(done) < len(milestone_keys):
        missing.append(f"{len(milestone_keys) - len(done)} milestone(s) still to tick")
    unmet = [c["text"] for c in lab["criteria"] if not checklist.get(c["key"])]
    if unmet:
        missing.append(f"{len(unmet)} completion criteria still to confirm")
    out = {
        "flags": flags,
        "stage": stage,
        "stage_label": STAGE_LABEL.get(stage, "Not started"),
        "milestones_done": done,
        "milestones_total": len(milestone_keys),
        "criteria_ok": criteria_ok,
        "interview": interview,
        "completion_missing": missing,
        "can_complete": not missing,
        "credited_by_history": credited_by_history,
        "repo_url": repo_url,
        "repo_check": check,
        "repo_ok": repo_ok,
    }
    out["verification"] = compute_verification(progress, out, project.kind)
    return out


def _summary(project: Project, state: dict, ids_by_slug: dict[str, uuid.UUID], ready: bool) -> dict:
    lab = project.lab
    return {
        "id": project.id,
        "slug": project.slug,
        "title": project.title,
        "level": project.level,
        "level_label": LEVEL_LABELS.get(project.level or "", ""),
        "difficulty": project.difficulty,
        "est_hours": project.est_hours,
        "kind": project.kind,
        "summary": lab["summary"],
        "skills": lab["skills"],
        "deliverable": lab["deliverable"],
        "stage": state["stage"],
        "stage_label": state["stage_label"],
        "flags": state["flags"],
        "milestones_done": len(state["milestones_done"]),
        "milestones_total": state["milestones_total"],
        "recommended_before": [ids_by_slug[s] for s in lab["recommended_before"] if s in ids_by_slug],
        "ready": ready,
        "verification": {"tier": state["verification"]["tier"], "badge": state["verification"]["badge"]},
    }


async def _states_for_user(db: AsyncSession, user_id: uuid.UUID, projects: list[Project]) -> dict[uuid.UUID, dict]:
    ids = [p.id for p in projects]
    progress = {
        r.project_id: r
        for r in (
            await db.execute(select(ProjectLabProgress).where(ProjectLabProgress.user_id == user_id, ProjectLabProgress.project_id.in_(ids)))
        ).scalars().all()
    }
    items = {
        i.project_id: i
        for i in (await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == user_id, PortfolioItem.project_id.in_(ids)))).scalars().all()
    }
    legacy = {
        r.project_id
        for r in (
            await db.execute(
                select(UserProgress).where(
                    UserProgress.user_id == user_id, UserProgress.project_id.in_(ids), UserProgress.status == ProgressStatus.completed
                )
            )
        ).scalars().all()
    }
    return {p.id: derive(p, progress.get(p.id), items.get(p.id), p.id in legacy) for p in projects}


# ----------------------------------------------------------------------- reads


async def career_curriculum(db: AsyncSession, user: User, career_slug: str) -> dict:
    path = (await db.execute(select(CareerPath).where(CareerPath.slug == career_slug))).scalar_one_or_none()
    if path is None:
        raise LabError("Career not found.", 404)
    projects = await _career_projects(db, path.id)
    if not projects:
        return {"career": {"slug": path.slug, "name": path.name}, "available": False, "levels": [], "totals": {}, "next_project_id": None}

    states = await _states_for_user(db, user.id, projects)
    ids_by_slug = {p.slug: p.id for p in projects}
    completed_slugs = {p.slug for p in projects if states[p.id]["flags"]["completed"]}

    def is_ready(p: Project) -> bool:
        return all(s in completed_slugs for s in p.lab["recommended_before"])

    summaries = [_summary(p, states[p.id], ids_by_slug, is_ready(p)) for p in projects]
    levels = []
    for level in LEVELS:
        group = [s for s in summaries if s["level"] == level]
        if group:
            levels.append({"level": level, "label": LEVEL_LABELS[level], "blurb": LEVEL_BLURBS[level], "projects": group})

    nxt = next((s for s in summaries if not s["flags"]["completed"] and s["ready"]), None) or next(
        (s for s in summaries if not s["flags"]["completed"]), None
    )
    totals = {
        "projects": len(summaries),
        "completed": sum(1 for s in summaries if s["flags"]["completed"]),
        "published": sum(1 for s in summaries if s["flags"]["published"]),
        "portfolio_ready": sum(1 for s in summaries if s["flags"]["portfolio_ready"]),
        "interview_ready": sum(1 for s in summaries if s["flags"]["interview_ready"]),
        "hours": sum(s["est_hours"] or 0 for s in summaries),
    }
    return {
        "career": {"slug": path.slug, "name": path.name},
        "available": True,
        "levels": levels,
        "totals": totals,
        "next_project_id": nxt["id"] if nxt else None,
        "evidence_note": EVIDENCE_NOTE,
    }


async def project_detail(db: AsyncSession, user: User, project_id: uuid.UUID) -> dict:
    project = await _project(db, project_id)
    lab = project.lab
    progress = await _progress(db, user.id, project.id)
    item = await _item(db, user.id, project.id)
    legacy = await _legacy_done(db, user.id, project.id)
    state = derive(project, progress, item, legacy)
    career = await _career_of(db, project)
    siblings = await _career_projects(db, career.id)
    sibling_states = await _states_for_user(db, user.id, siblings)
    by_slug = {p.slug: p for p in siblings}

    def link(p: Project) -> dict:
        st = sibling_states[p.id]
        return {"id": p.id, "slug": p.slug, "title": p.title, "level": p.level, "stage": st["stage"], "stage_label": st["stage_label"], "completed": st["flags"]["completed"]}

    before = [link(by_slug[s]) for s in lab["recommended_before"] if s in by_slug]
    ready_for = [link(p) for p in siblings if project.slug in p.lab["recommended_before"]]

    checklist = dict(progress.checklist or {}) if progress else {}
    answers = dict(progress.interview_answers or {}) if progress else {}
    check = state["repo_check"]
    checks = check.get("checks", {}) if state["repo_ok"] or check.get("reachable") else {}

    def gh_item(key: str, label: str) -> dict:
        verify_key = VERIFIED_BY_CHECK.get(key)
        verified = None
        if verify_key and check:
            verified = bool(check.get("reachable")) if verify_key == "reachable" else bool(checks.get(verify_key))
        return {"key": key, "label": label, "checked": bool(checklist.get(key)), "verified": verified}

    done = set(state["milestones_done"])
    flags = state["flags"]
    journey = [
        {"key": m["key"], "title": m["title"], "stage": m["stage"], "done": m["key"] in done, "manual": True}
        for m in lab["milestones"]
    ] + [
        {"key": "repo_prep", "title": "Prepare the repository: .gitignore, secrets check, README", "stage": "publish", "done": bool(check.get("checks", {}).get("gitignore") and check.get("checks", {}).get("readme")), "manual": False},
        {"key": "publish", "title": "Publish a public repository with a real commit history", "stage": "publish", "done": flags["published"], "manual": False},
        {"key": "portfolio", "title": "Add the project to your portfolio", "stage": "portfolio", "done": flags["portfolio_ready"], "manual": False},
        {"key": "interview", "title": "Write your own interview answers", "stage": "interview", "done": flags["interview_ready"], "manual": False},
    ]

    publish_steps = CASE_STUDY_PUBLISH_STEPS if project.kind == "case_study" else PUBLISH_STEPS
    return {
        "id": project.id,
        "slug": project.slug,
        "title": project.title,
        "level": project.level,
        "level_label": LEVEL_LABELS.get(project.level or "", ""),
        "difficulty": project.difficulty,
        "est_hours": project.est_hours,
        "kind": project.kind,
        "career": {"slug": career.slug, "name": career.name},
        "summary": lab["summary"],
        "overview": lab["overview"],
        "skills": lab["skills"],
        "tools": lab["tools"],
        "deliverable": lab["deliverable"],
        "requirements": lab["requirements"],
        "milestones": [{**m, "done": m["key"] in done} for m in lab["milestones"]],
        "journey": journey,
        "documentation": lab["documentation"],
        "security_notes": lab["security_notes"],
        "hints": project.hints,
        "common_mistakes": project.common_mistakes,
        "cv_bullet": lab.get("cv_bullet", ""),
        "criteria": [{**c, "checked": bool(checklist.get(c["key"]))} for c in lab["criteria"]],
        "interview": {
            "technical": [{**q, "answer": answers.get(q["key"], "")} for q in lab["interview"]],
            "universal": [{"key": f"u{i}", "q": q["q"], "covers": q["covers"], "answer": answers.get(f"u{i}", "")} for i, q in enumerate(UNIVERSAL_INTERVIEW, 1)],
            "min_chars": INTERVIEW_MIN_CHARS,
            "min_universal": INTERVIEW_MIN_UNIVERSAL,
            **{k: v for k, v in state["interview"].items()},
        },
        "github": {
            "steps": publish_steps,
            "checklist": [gh_item(k, label) for k, label in GITHUB_CHECKLIST],
            "security_checklist": [{"key": k, "label": label, "checked": bool(checklist.get(k)), "verified": (None if k not in VERIFIED_BY_CHECK or not check else bool(checks.get(VERIFIED_BY_CHECK[k])))} for k, label in SECURITY_CHECKLIST],
            "security_guidance": SECURITY_GUIDANCE,
            "repo_url": state["repo_url"],
            "repo_check": check,
            "repo_ok": state["repo_ok"],
        },
        "readme": {
            "sections": [{"key": k, "title": t, "guidance": g, "prefill": lab["readme"].get(k, "")} for k, t, g in README_SECTIONS],
        },
        "stage": state["stage"],
        "stage_label": state["stage_label"],
        "flags": flags,
        "verification": state["verification"],
        "lifecycle": [
            {"key": "started", "label": "Started", "reached": flags["started"]},
            {"key": "in_progress", "label": "In progress", "reached": flags["in_progress"]},
            {"key": "completed", "label": "Completed", "reached": flags["completed"]},
            {"key": "submitted", "label": "Submitted for review", "reached": state["verification"]["tier"] in {"in_review", "verified", "changes_requested"}},
            {"key": "verified", "label": "Verified", "reached": state["verification"]["tier"] == "verified"},
            {"key": "portfolio_ready", "label": "Portfolio ready", "reached": flags["portfolio_ready"]},
            {"key": "interview_ready", "label": "Interview ready", "reached": flags["interview_ready"]},
        ],
        "stages": [{"key": k, "label": label, "description": desc, "reached": flags[k]} for k, label, desc in STAGES],
        "milestones_done": len(done),
        "milestones_total": state["milestones_total"],
        "completion": {"can_complete": state["can_complete"], "missing": state["completion_missing"], "completed": flags["completed"]},
        "credited_by_history": state["credited_by_history"],
        "started": flags["started"],
        "portfolio": {"item_id": item.id if item else None, "is_published": bool(item and item.is_published)},
        "recommended_before": before,
        "ready_for": ready_for,
        "evidence_note": EVIDENCE_NOTE,
    }


async def overview(db: AsyncSession, user: User, career_slug: str | None = None) -> dict:
    if career_slug is None:
        row = (
            await db.execute(
                select(CareerPath.slug)
                .join(Roadmap, Roadmap.path_id == CareerPath.id)
                .where(Roadmap.user_id == user.id, Roadmap.status == RoadmapStatus.active)
                .order_by(Roadmap.created_at.desc())
            )
        ).scalars().first()
        career_slug = row
    if not career_slug:
        return {"available": False}
    data = await career_curriculum(db, user, career_slug)
    if not data["available"]:
        return {"available": False, "career": data["career"]}
    flat = [p for level in data["levels"] for p in level["projects"]]
    started = [p for p in flat if p["flags"]["started"] and not p["flags"]["completed"]]
    current = next((p for p in started), None)
    upcoming = next((p for p in flat if p["id"] == data["next_project_id"]), None)
    return {
        "available": True,
        "career": data["career"],
        "totals": data["totals"],
        "current": current,
        "next": upcoming if upcoming and (not current or upcoming["id"] != current["id"]) else None,
        "completed": [p for p in flat if p["flags"]["completed"]],
        "projects": flat,
        "evidence_note": EVIDENCE_NOTE,
    }


# ---------------------------------------------------------------------- writes


def _touch(progress: ProjectLabProgress) -> None:
    if progress.started_at is None:
        progress.started_at = datetime.now(timezone.utc)


async def _ensure(db: AsyncSession, user: User, project: Project) -> ProjectLabProgress:
    progress = await _progress(db, user.id, project.id)
    if progress is None:
        progress = ProjectLabProgress(user_id=user.id, project_id=project.id, milestones=[], checklist={}, repo_check={}, interview_answers={})
        db.add(progress)
    _touch(progress)
    return progress


def _regress_if_incomplete(project: Project, progress: ProjectLabProgress) -> None:
    """Un-ticking evidence after completing takes the Completed stage away."""
    if progress.completed_at is None:
        return
    keys = {m["key"] for m in project.lab["milestones"]}
    crit = [c["key"] for c in project.lab["criteria"]]
    if not keys.issubset(set(progress.milestones or [])) or not all((progress.checklist or {}).get(k) for k in crit):
        progress.completed_at = None


def _clear_review(progress: ProjectLabProgress) -> None:
    progress.review_status = "none"
    progress.submitted_at = None
    progress.submitted_note = ""
    progress.submitted_repo_url = ""
    progress.reviewer_id = None
    progress.reviewer_name = ""
    progress.reviewed_at = None
    progress.review_note = ""


MAX_SUBMIT_NOTE = 1000


async def submit_for_review(db: AsyncSession, user: User, project_id: uuid.UUID, note: str) -> dict:
    """Ask a reviewer to read the project. This only queues the request: the
    project becomes Verified when a reviewer approves it, never before."""
    project = await _project(db, project_id)
    progress = await _progress(db, user.id, project.id)
    item = await _item(db, user.id, project.id)
    state = derive(project, progress, item, await _legacy_done(db, user.id, project.id))
    ver = state["verification"]
    if progress is None or not ver["can_submit"]:
        if ver["tier"] == "in_review":
            raise LabError("This project is already waiting for a reviewer.", 400)
        if ver["tier"] == "verified":
            raise LabError("This project is already verified.", 400)
        raise LabError(" ".join(ver["submit_blockers"]) or "This project is not ready for review yet.", 400)
    progress.review_status = "pending"
    progress.submitted_at = datetime.now(timezone.utc)
    progress.submitted_note = (note or "").strip()[:MAX_SUBMIT_NOTE]
    progress.submitted_repo_url = progress.repo_url
    progress.reviewer_id = None
    progress.reviewer_name = ""
    progress.reviewed_at = None
    progress.review_note = ""
    await db.commit()
    return await project_detail(db, user, project_id)


async def start(db: AsyncSession, user: User, project_id: uuid.UUID) -> dict:
    project = await _project(db, project_id)
    if await _progress(db, user.id, project.id) is None and await _legacy_done(db, user.id, project.id):
        # Finished before the Project Lab existed: nothing to start.
        return await project_detail(db, user, project_id)
    await _ensure(db, user, project)
    await db.commit()
    return await project_detail(db, user, project_id)


async def set_milestone(db: AsyncSession, user: User, project_id: uuid.UUID, key: str, done: bool) -> dict:
    project = await _project(db, project_id)
    if key not in {m["key"] for m in project.lab["milestones"]}:
        raise LabError("Unknown milestone.", 404)
    progress = await _ensure(db, user, project)
    current = set(progress.milestones or [])
    current.add(key) if done else current.discard(key)
    progress.milestones = sorted(current)
    _regress_if_incomplete(project, progress)
    await db.commit()
    return await project_detail(db, user, project_id)


async def set_checklist(db: AsyncSession, user: User, project_id: uuid.UUID, updates: dict[str, bool]) -> dict:
    project = await _project(db, project_id)
    allowed = {c["key"] for c in project.lab["criteria"]} | GH_KEYS | SEC_KEYS
    unknown = [k for k in updates if k not in allowed]
    if unknown:
        raise LabError("Unknown checklist item.", 422)
    progress = await _ensure(db, user, project)
    current = dict(progress.checklist or {})
    for key, value in updates.items():
        current[key] = bool(value)
    progress.checklist = current
    _regress_if_incomplete(project, progress)
    await db.commit()
    return await project_detail(db, user, project_id)


async def set_repository(db: AsyncSession, user: User, project_id: uuid.UUID, url: str) -> dict:
    project = await _project(db, project_id)
    try:
        owner, repo = repo_check.parse_repo_url(url)
    except repo_check.InvalidRepositoryUrl as exc:
        raise LabError(str(exc), 422) from exc
    canonical = repo_check.canonical_url(owner, repo)
    progress = await _ensure(db, user, project)
    if progress.repo_url != canonical:
        progress.repo_url = canonical
        progress.repo_check = {}
        # A review applies to one repository. A new link starts over.
        _clear_review(progress)
    await db.commit()
    return await project_detail(db, user, project_id)


async def check_repository(db: AsyncSession, user: User, project_id: uuid.UUID) -> dict:
    project = await _project(db, project_id)
    progress = await _progress(db, user.id, project.id)
    if progress is None or not progress.repo_url:
        raise LabError("Add your repository link first.", 400)
    try:
        result = await repo_check.inspect_repository(progress.repo_url)
    except repo_check.InvalidRepositoryUrl as exc:
        raise LabError(str(exc), 422) from exc
    progress.repo_check = result
    await db.commit()
    return await project_detail(db, user, project_id)


async def set_interview(db: AsyncSession, user: User, project_id: uuid.UUID, answers: dict[str, str]) -> dict:
    project = await _project(db, project_id)
    allowed = {q["key"] for q in project.lab["interview"]} | set(UNIVERSAL_KEYS)
    if any(k not in allowed for k in answers):
        raise LabError("Unknown interview question.", 422)
    progress = await _ensure(db, user, project)
    current = dict(progress.interview_answers or {})
    for key, text in answers.items():
        current[key] = (text or "").strip()[:MAX_ANSWER_CHARS]
    progress.interview_answers = current
    await db.commit()
    return await project_detail(db, user, project_id)


async def complete(db: AsyncSession, user: User, project_id: uuid.UUID) -> dict:
    project = await _project(db, project_id)
    progress = await _progress(db, user.id, project.id)
    item = await _item(db, user.id, project.id)
    state = derive(project, progress, item, False)
    if progress is None or not state["can_complete"]:
        raise LabError("Not ready to complete yet: " + "; ".join(state["completion_missing"] or ["start the project first"]) + ".", 400)
    if progress.completed_at is None:
        progress.completed_at = datetime.now(timezone.utc)
        already = await _legacy_done(db, user.id, project.id)
        if not already:
            await roadmap_service.submit_project(db, user.id, project.id, via_lab=True)
    await db.commit()
    return await project_detail(db, user, project_id)


async def add_to_portfolio(db: AsyncSession, user: User, project_id: uuid.UUID) -> dict:
    project = await _project(db, project_id)
    progress = await _progress(db, user.id, project.id)
    item = await _item(db, user.id, project.id)
    state = derive(project, progress, item, await _legacy_done(db, user.id, project.id))
    if not state["flags"]["completed"]:
        raise LabError("Complete the project before adding it to your portfolio.", 400)
    if project.kind == "code" and not state["flags"]["published"]:
        raise LabError("Publish your repository first. Add the link and run the repository check, so your portfolio points at real work.", 400)
    item = await portfolio_service.generate_portfolio_item(db, user, project.id, project.lab["deliverable"])
    item.repo_url = state["repo_url"]
    item.is_published = True
    await db.commit()
    # Start the case study as an editable draft. Results and screenshots stay
    # empty for the person to fill in, because only they know them.
    if not item.case_study:
        await case_study_service.generate(db, user.id, item.id)
    return await project_detail(db, user, project_id)


async def available_careers(db: AsyncSession) -> list[dict]:
    """Careers that have a Project Lab curriculum, with how many projects each has."""
    rows = (
        await db.execute(
            select(CareerPath.slug, CareerPath.name, Project.id)
            .join(RoadmapPhase, RoadmapPhase.path_id == CareerPath.id)
            .join(Project, Project.phase_id == RoadmapPhase.id)
            .where(Project.slug.isnot(None), Project.lab.isnot(None))
        )
    ).all()
    counts: dict[str, dict] = {}
    for slug, name, _ in rows:
        entry = counts.setdefault(slug, {"slug": slug, "name": name, "projects": 0})
        entry["projects"] += 1
    return sorted(counts.values(), key=lambda c: c["name"])
