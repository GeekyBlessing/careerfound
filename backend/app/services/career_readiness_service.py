"""Career Readiness Score.

One number out of 100, built from seven signals that each come from something
the person actually did on CareerFound. Nothing here is a guess about talent
and nothing is self-reported: a skill you list on your profile or a
certification you type in is shown to employers (labelled self-reported) but
never moves this score.

Every signal has a stated target ("three published projects"), so the score is
arithmetic anyone can check, and every signal says what would raise it and
links to the page where you can do that.

Careers that do not have a Project Lab yet have no repository evidence to
measure. For those, the three repository based signals are marked unavailable
and the remaining weights are scaled up to total 100, rather than leaving
people capped below the maximum for something the platform cannot yet measure.

This is separate from services/readiness_service.py, which feeds older
surfaces and stays as it was.
"""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.lab import ProjectLabProgress
from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, UserProgress, UserSimulationAttempt
from app.models.roadmap import Lesson, Project, Quiz, Roadmap, RoadmapPhase, RoadmapStatus
from app.models.user import User
from app.services import lab_service, skill_gap_analyzer
from app.services.verification import verification

# Weights add up to 100 when every signal is available.
SIGNALS = [
    ("learning", "Learning", 20),
    ("skills", "Skills", 15),
    ("projects", "Projects", 20),
    ("documentation", "Documentation", 10),
    ("proof", "Proof of work", 15),
    ("portfolio", "Portfolio", 10),
    ("interview", "Interview preparation", 10),
]
LAB_ONLY = {"documentation", "proof"}

PROJECT_TARGET = 4
DOC_TARGET = 3
PROOF_TARGET = 3
PORTFOLIO_TARGET = 3
INTERVIEW_PROJECT_TARGET = 2
SIM_CORRECT_TARGET = 10

BANDS = [
    (20, "Just starting"),
    (40, "Building foundations"),
    (60, "Gaining momentum"),
    (80, "Getting job ready"),
    (101, "Ready to apply"),
]

NOT_COUNTED = (
    "Skills and certifications you add yourself are shown on your profile and labelled self-reported. "
    "They do not change this score, because nothing checks them."
)


def _pct(done: float, target: float) -> int:
    if target <= 0:
        return 0
    return max(0, min(100, round(done / target * 100)))


def _band(score: int) -> str:
    for ceiling, label in BANDS:
        if score < ceiling:
            return label
    return BANDS[-1][1]


async def _active_path(db: AsyncSession, user_id: uuid.UUID) -> CareerPath | None:
    return (
        await db.execute(
            select(CareerPath)
            .join(Roadmap, Roadmap.path_id == CareerPath.id)
            .where(Roadmap.user_id == user_id, Roadmap.status == RoadmapStatus.active)
            .order_by(Roadmap.created_at.desc())
        )
    ).scalars().first()


def _empty(href: str, title: str, reason: str) -> dict:
    return {
        "has_path": False,
        "has_activity": False,
        "score": 0,
        "band": "No score yet",
        "career": None,
        "signals": [],
        "why": "There is nothing to measure yet. Pick a career and your readiness starts the moment you finish your first lesson.",
        "biggest_opportunity": None,
        "next_action": {"title": title, "reason": reason, "href": href, "cta": "Start here"},
        "has_lab": False,
        "not_counted": NOT_COUNTED,
    }


async def compute(db: AsyncSession, user: User) -> dict:
    path = await _active_path(db, user.id)
    if path is None:
        return _empty("/onboarding", "Find your career path", "Take the career assessment so your roadmap, projects and readiness are built around one career.")

    phase_ids = [r for r in (await db.execute(select(RoadmapPhase.id).where(RoadmapPhase.path_id == path.id))).scalars().all()]
    phases = {p.id: p for p in (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id))).scalars().all()}

    # ---- learning
    lessons = (await db.execute(select(Lesson).where(Lesson.phase_id.in_(phase_ids)))).scalars().all() if phase_ids else []
    lessons.sort(key=lambda l: (phases[l.phase_id].order_index, l.order_index))
    quizzes = (await db.execute(select(Quiz).where(Quiz.phase_id.in_(phase_ids)))).scalars().all() if phase_ids else []
    quizzes.sort(key=lambda q: (phases[q.phase_id].order_index, q.title))
    done_ids = {
        r
        for r in (
            await db.execute(
                select(UserProgress.lesson_id).where(
                    UserProgress.user_id == user.id, UserProgress.lesson_id.isnot(None), UserProgress.status == ProgressStatus.completed
                )
            )
        ).scalars().all()
    }
    done_quiz_ids = {
        r
        for r in (
            await db.execute(
                select(UserProgress.quiz_id).where(
                    UserProgress.user_id == user.id, UserProgress.quiz_id.isnot(None), UserProgress.status == ProgressStatus.completed
                )
            )
        ).scalars().all()
    }
    lessons_done = [l for l in lessons if l.id in done_ids]
    quizzes_done = [q for q in quizzes if q.id in done_quiz_ids]
    learning_total = len(lessons) + len(quizzes)
    learning_done = len(lessons_done) + len(quizzes_done)

    # ---- skills (how much of each skill's lessons and projects is finished)
    skill_rows = await skill_gap_analyzer.coverage(db, user.id, path.id)
    skills_pct = skill_gap_analyzer.skills_pct(skill_rows)

    # ---- projects, documentation, proof, interview (Project Lab)
    lab_projects = await lab_service._career_projects(db, path.id)
    has_lab = bool(lab_projects)
    lab_rows: list[dict] = []
    if has_lab:
        states = await lab_service._states_for_user(db, user.id, lab_projects)
        progress_rows = {
            r.project_id: r
            for r in (
                await db.execute(
                    select(ProjectLabProgress).where(ProjectLabProgress.user_id == user.id, ProjectLabProgress.project_id.in_([p.id for p in lab_projects]))
                )
            ).scalars().all()
        }
        for p in lab_projects:
            st = states[p.id]
            prog = progress_rows.get(p.id)
            ver = verification(prog, st, p.kind)
            check = st["repo_check"].get("checks", {}) if st["repo_ok"] else {}
            lab_rows.append(
                {
                    "project": p,
                    "state": st,
                    "verification": ver,
                    "documented": bool(st["flags"]["completed"] and (check.get("readme") or p.kind == "case_study")),
                }
            )

    if has_lab:
        completed_n = sum(1 for r in lab_rows if r["state"]["flags"]["completed"])
        projects_current, projects_target = completed_n, PROJECT_TARGET
        projects_detail = f"{completed_n} of {PROJECT_TARGET} target projects completed. A completed project has every milestone ticked and its completion criteria confirmed."
    else:
        legacy_projects = (await db.execute(select(Project).where(Project.phase_id.in_(phase_ids)))).scalars().all() if phase_ids else []
        legacy_done = {
            r
            for r in (
                await db.execute(
                    select(UserProgress.project_id).where(
                        UserProgress.user_id == user.id, UserProgress.project_id.isnot(None), UserProgress.status == ProgressStatus.completed
                    )
                )
            ).scalars().all()
        }
        done_legacy = sum(1 for p in legacy_projects if p.id in legacy_done)
        projects_target = min(PROJECT_TARGET, len(legacy_projects))
        projects_current = min(done_legacy, projects_target)
        projects_detail = (
            f"{done_legacy} of {projects_target} projects completed on your path."
            if projects_target
            else "This career does not have projects yet."
        )

    documented_n = sum(1 for r in lab_rows if r["documented"])
    published_n = sum(1 for r in lab_rows if r["state"]["flags"]["published"])
    verified_n = sum(1 for r in lab_rows if r["verification"]["tier"] == "verified")
    proof_points = published_n * 0.5 + verified_n * 0.5
    interview_ready_n = sum(1 for r in lab_rows if r["state"]["flags"]["interview_ready"])

    # ---- portfolio and interview practice
    portfolio_n = (
        await db.execute(select(func.count(PortfolioItem.id)).where(PortfolioItem.user_id == user.id, PortfolioItem.is_published.is_(True)))
    ).scalar_one()
    sim_correct = (
        await db.execute(
            select(func.count(UserSimulationAttempt.id)).where(UserSimulationAttempt.user_id == user.id, UserSimulationAttempt.correct.is_(True))
        )
    ).scalar_one()
    lab_interview_pct = _pct(interview_ready_n, INTERVIEW_PROJECT_TARGET)
    sim_pct = _pct(sim_correct, SIM_CORRECT_TARGET)
    interview_pct = round((lab_interview_pct + sim_pct) / 2) if has_lab else sim_pct

    raw = {
        "learning": (_pct(learning_done, learning_total), f"{learning_done} of {learning_total} lessons and checkpoint quizzes finished on your {path.name} roadmap." if learning_total else "Lessons for this career are not published yet."),
        "skills": (skills_pct, f"{sum(1 for r in skill_rows if r['status'] == 'strong')} of {len(skill_rows)} {path.name} skills are strong, meaning every lesson and project that teaches them is finished." if skill_rows else "Skill tracking is not set up for this career yet."),
        "projects": (_pct(projects_current, projects_target), projects_detail),
        "documentation": (_pct(documented_n, DOC_TARGET), f"{documented_n} of {DOC_TARGET} completed projects have a README on a public repository."),
        "proof": (_pct(proof_points, PROOF_TARGET), f"{published_n} published and {verified_n} reviewed. A published repository counts for half, a reviewer approval adds the other half. Target: {PROOF_TARGET} projects."),
        "portfolio": (_pct(portfolio_n, PORTFOLIO_TARGET), f"{portfolio_n} of {PORTFOLIO_TARGET} portfolio pieces published."),
        "interview": (
            interview_pct,
            (f"{interview_ready_n} of {INTERVIEW_PROJECT_TARGET} projects with written interview answers, and {sim_correct} of {SIM_CORRECT_TARGET} practice scenarios answered correctly.")
            if has_lab
            else f"{sim_correct} of {SIM_CORRECT_TARGET} practice scenarios answered correctly.",
        ),
    }

    available = {k for k, _, _ in SIGNALS if has_lab or k not in LAB_ONLY}
    weight_total = sum(w for k, _, w in SIGNALS if k in available)
    signals = []
    for key, label, weight in SIGNALS:
        pct, detail = raw[key]
        if key in available:
            eff = weight * 100 / weight_total
            points = eff * pct / 100
        else:
            eff, points = 0.0, 0.0
        signals.append(
            {
                "key": key,
                "label": label,
                "available": key in available,
                "weight": round(eff, 1),
                "pct": pct if key in available else None,
                "points": round(points, 1),
                "potential": round(eff - points, 1),
                "detail": detail if key in available else "Needs a Project Lab for this career, which is not built yet. It is left out of your score rather than counted as zero.",
            }
        )

    score = round(sum(s["points"] for s in signals))
    has_activity = any((s["pct"] or 0) > 0 for s in signals)

    ctx = {
        "lessons": lessons,
        "done_ids": done_ids,
        "quizzes": quizzes,
        "done_quiz_ids": done_quiz_ids,
        "skill_rows": skill_rows,
        "lab_rows": lab_rows,
        "has_lab": has_lab,
        "portfolio_n": portfolio_n,
    }
    for s in signals:
        s["action"] = _action(s["key"], ctx) if s["available"] else None

    live = [s for s in signals if s["available"]]
    order = {k: i for i, (k, _, _) in enumerate(SIGNALS)}
    best = sorted(live, key=lambda s: (-s["potential"], order[s["key"]]))[0]
    action = best["action"] or _action("projects", ctx) or _action("learning", ctx)
    # If the best signal has no concrete first step yet, work on whatever it
    # depends on, so the recommendation is always something the person can do now.
    biggest = {
        "signal": best["key"],
        "label": best["label"],
        "gain": round(best["potential"], 1),
        "text": f"{best['label']} has the most room to grow: up to {round(best['potential'])} more points.",
        "action": action,
    }

    strongest = max(live, key=lambda s: (s["pct"], -order[s["key"]]))
    weakest = min(live, key=lambda s: (s["pct"], order[s["key"]]))
    if not has_activity:
        why = f"Nothing on your {path.name} path has been measured yet. Your score starts moving when you finish a lesson, and every signal below shows what it counts."
    elif strongest["key"] == weakest["key"]:
        why = f"Your score of {score} comes from {len(live)} signals on your {path.name} path."
    else:
        why = (
            f"Your score of {score} comes from {len(live)} signals on your {path.name} path. "
            f"{strongest['label']} is your strongest at {strongest['pct']}%, and {weakest['label'].lower()} is the lowest at {weakest['pct']}%."
        )

    return {
        "has_path": True,
        "has_activity": has_activity,
        "score": score,
        "band": _band(score) if has_activity else "No score yet",
        "career": {"slug": path.slug, "name": path.name},
        "has_lab": has_lab,
        "signals": signals,
        "why": why,
        "biggest_opportunity": biggest,
        "next_action": {"title": action["title"], "reason": action["reason"], "href": action["href"], "cta": action["cta"]},
        "not_counted": NOT_COUNTED,
        "formula": "Each signal is a percentage of a stated target. The score adds up weight times percentage across the signals that apply to your career.",
    }


# ---------------------------------------------------------------------------- actions


def _a(title: str, reason: str, href: str, cta: str) -> dict:
    return {"title": title, "reason": reason, "href": href, "cta": cta}


def _action(key: str, ctx: dict) -> dict | None:
    rows = ctx["lab_rows"]

    def link(r) -> str:
        return f"/projects/{r['project'].id}"

    if key == "learning":
        nxt = next((l for l in ctx["lessons"] if l.id not in ctx["done_ids"]), None)
        if nxt:
            return _a(f"Finish the lesson \"{nxt.title}\"", "Lessons are the base of every other signal. They build your skills and unlock the projects.", "/roadmap", "Open your roadmap")
        quiz = next((q for q in ctx["quizzes"] if q.id not in ctx["done_quiz_ids"]), None)
        if quiz:
            return _a(f"Take the quiz \"{quiz.title}\"", "Quizzes show you whether the lessons stuck.", f"/roadmap/quiz/{quiz.id}", "Start the quiz")
        return None

    if key == "skills":
        rows_ = [r for r in ctx["skill_rows"] if r["status"] != "strong"]
        rows_.sort(key=lambda r: (0 if r["status"] == "developing" else 1))
        if rows_:
            label = rows_[0]["node"].label
            return _a(f"Close the gap in {label}", "The skill gap page shows which lessons and projects build it, in order.", "/skill-gap", "See your skill gaps")
        return None

    if key == "projects":
        if not ctx["has_lab"]:
            return _a("Work on your next project", "Finished projects are the strongest proof you can show.", "/roadmap", "Open your roadmap")
        current = next((r for r in rows if r["state"]["flags"]["started"] and not r["state"]["flags"]["completed"]), None)
        if current:
            p = current["project"]
            return _a(f"Continue \"{p.title}\"", f"You have {len(current['state']['milestones_done'])} of {current['state']['milestones_total']} milestones done.", link(current), "Open the project")
        nxt = next((r for r in rows if not r["state"]["flags"]["completed"]), None)
        if nxt:
            p = nxt["project"]
            return _a(f"Start \"{p.title}\"", "Projects carry the most weight in your readiness, and this is the next one in your curriculum.", link(nxt), "Open the project")
        return None

    if key == "documentation":
        row = next((r for r in rows if r["state"]["flags"]["completed"] and not r["documented"]), None)
        if row:
            return _a(f"Add a README to \"{row['project'].title}\"", "A README on a public repository is the first thing a reviewer opens.", link(row), "Open the project")
        return None

    if key == "proof":
        unpublished = next((r for r in rows if r["state"]["flags"]["completed"] and not r["state"]["flags"]["published"]), None)
        if unpublished:
            return _a(f"Publish \"{unpublished['project'].title}\" to GitHub", "Published work can be checked. Work on your laptop cannot.", link(unpublished), "Open the project")
        unreviewed = next((r for r in rows if r["state"]["flags"]["published"] and r["verification"]["tier"] in {"evidence_checked", "changes_requested"}), None)
        if unreviewed:
            return _a(f"Submit \"{unreviewed['project'].title}\" for review", "A reviewer who reads your project and approves it earns you the CareerFound Verified badge.", link(unreviewed), "Open the project")
        return None

    if key == "portfolio":
        row = next((r for r in rows if r["state"]["flags"]["published"] and not r["state"]["flags"]["portfolio_ready"]), None)
        if row:
            return _a(f"Add \"{row['project'].title}\" to your portfolio", "Your portfolio is the page you send to employers.", link(row), "Open the project")
        if ctx["portfolio_n"]:
            return _a("Publish your portfolio pieces", "Drafts are only visible to you.", "/portfolio", "Open your portfolio")
        return None

    if key == "interview":
        row = next((r for r in rows if r["state"]["flags"]["completed"] and not r["state"]["flags"]["interview_ready"]), None)
        if row:
            return _a(f"Write your interview answers for \"{row['project'].title}\"", "Interviewers ask about your projects. Answers in your own words are what they hear.", link(row), "Open the project")
        return _a("Practise a mock interview", "Practice scenarios build interview readiness.", "/mentor", "Open AI Mentor")

    return None
