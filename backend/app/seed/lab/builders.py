"""Small helpers that turn the compact tuples used in the career modules into
the full project dictionaries the sync and the API expect.

Authors write milestones, questions and criteria as short tuples so a project
reads like an outline. The helper assigns stable keys (m1, m2, q1, c1, d1), and
those keys are what user progress is stored against, so reordering inside a
project is safe but renaming or removing a key would orphan saved progress.
Add new items at the end of a list.
"""

from __future__ import annotations

from app.seed.lab.universal import LEVEL_DIFFICULTY, MANUAL_STAGES


def project(
    *,
    slug: str,
    title: str,
    level: str,
    phase: str,
    est_hours: int,
    summary: str,
    build: str,
    problem: str,
    why: str,
    skills: list[str],
    tools: list[tuple[str, str]],
    deliverable: str,
    requirements: list[str],
    milestones: list[tuple[str, str, str]],
    documentation: list[tuple[str, str]],
    security_notes: list[str],
    interview: list[tuple[str, str]],
    criteria: list[str],
    readme: dict[str, str],
    hints: list[str],
    common_mistakes: list[str],
    recommended_before: list[str] | None = None,
    legacy_title: str | None = None,
    kind: str = "code",
    cv_bullet: str = "",
) -> dict:
    for stage, _, _ in milestones:
        if stage not in MANUAL_STAGES:
            raise ValueError(f"{slug}: milestone stage {stage!r} must be one of {MANUAL_STAGES}")
    return {
        "slug": slug,
        "title": title,
        "level": level,
        "difficulty": LEVEL_DIFFICULTY[level],
        "phase": phase,
        "legacy_title": legacy_title,
        "est_hours": est_hours,
        "kind": kind,
        "recommended_before": recommended_before or [],
        "summary": summary,
        "overview": {"build": build, "problem": problem, "why": why},
        "skills": skills,
        "tools": [{"name": n, "reason": r} for n, r in tools],
        "deliverable": deliverable,
        "requirements": requirements,
        "milestones": [
            {"key": f"m{i}", "stage": stage, "title": t, "detail": d} for i, (stage, t, d) in enumerate(milestones, 1)
        ],
        "documentation": [{"key": f"d{i}", "title": t, "detail": d} for i, (t, d) in enumerate(documentation, 1)],
        "security_notes": security_notes,
        "interview": [{"key": f"q{i}", "q": q, "covers": c} for i, (q, c) in enumerate(interview, 1)],
        "criteria": [{"key": f"c{i}", "text": t} for i, t in enumerate(criteria, 1)],
        "readme": readme,
        "hints": hints,
        "common_mistakes": common_mistakes,
        "cv_bullet": cv_bullet,
    }
