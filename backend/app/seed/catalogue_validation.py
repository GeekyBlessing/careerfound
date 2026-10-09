"""Content checks for career catalogue data.

One place that says what a publishable career looks like. It is used by the
test suite (against the whole merged catalogue) and by the authoring script
(against a single new module) so a career cannot ship half written.

Nothing here judges whether a sentence is *good*. It checks the things a
machine can check honestly: every required field exists and is the right
shape, there is no placeholder text, no typographic long dashes, nothing is
copied between careers, and the three project tiers are really there.
"""

from __future__ import annotations

import re
from collections.abc import Iterable

REQUIRED_CAREER_FIELDS = (
    "slug", "name", "summary", "beginner_summary", "difficulty", "avg_timeline_weeks", "entry_roles", "tools",
    "remote_potential", "earning_notes", "icon", "skills_required", "certifications", "interview_prep",
    "learning_resources", "roadmap_outline",
)
REQUIRED_META_FIELDS = ("keywords", "who_its_for", "portfolio_expectations", "career_progression")
PROJECT_FIELDS = ("title", "teaches", "prerequisites", "expected_output", "steps", "hints", "common_mistakes", "difficulty")
PHASE_TITLES = ("Foundations", "Building Real Skills", "Advanced Practice")
PROJECT_TIERS = (1, 3, 5)
SKILL_CATEGORIES = {"foundation", "core", "advanced"}

_DASH_ENTITIES = "|".join(["&" + "mdash;", "&" + "ndash;", "&#" + "8212;", "&#" + "8211;"])
LONG_DASHES = re.compile("[\u2012\u2013\u2014\u2015\u2212\u2e3a\u2e3b\ufe58\ufe63\uff0d]|" + _DASH_ENTITIES)
PLACEHOLDER = re.compile(r"\b(lorem|ipsum|tbd|todo|placeholder|coming soon|to be written|xxx)\b", re.I)
SALARY = re.compile(r"[$£€₦]\s?\d|\b\d{2,3}\s?k\b|\bper (year|annum)\b", re.I)


def _strings(value) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for v in value.values():
            yield from _strings(v)
    elif isinstance(value, (list, tuple)):
        for v in value:
            yield from _strings(v)


def check_text(label: str, value, *, prose: bool = True) -> list[str]:
    """Long dashes are never allowed. `prose` (career-level copy) also forbids
    placeholder wording and invented salary figures. Project steps are exempt
    from those two because they legitimately say things like "placeholder text"
    in a design critique or "$500 budget" in a worked example."""
    problems = []
    for text in _strings(value):
        if LONG_DASHES.search(text):
            problems.append(f"{label}: long dash in {text[:60]!r}")
        if prose and PLACEHOLDER.search(text):
            problems.append(f"{label}: placeholder wording in {text[:60]!r}")
        if prose and SALARY.search(text):
            problems.append(f"{label}: contains a salary figure, which we do not invent: {text[:60]!r}")
    return problems


def _nonempty_str(v) -> bool:
    return isinstance(v, str) and len(v.strip()) > 0


def check_career(career: dict) -> list[str]:
    """Problems with one fully merged career entry (career fields plus taxonomy meta)."""
    slug = career.get("slug", "?")
    problems: list[str] = []
    for field in REQUIRED_CAREER_FIELDS + REQUIRED_META_FIELDS:
        if field not in career:
            problems.append(f"{slug}: missing {field}")
    if problems:
        return problems

    if not 1 <= career["difficulty"] <= 5:
        problems.append(f"{slug}: difficulty must be 1 to 5")
    if not 4 <= career["avg_timeline_weeks"] <= 120:
        problems.append(f"{slug}: avg_timeline_weeks {career['avg_timeline_weeks']} is not believable")
    if not 0 <= career["remote_potential"] <= 100:
        problems.append(f"{slug}: remote_potential must be 0 to 100")
    for field, low in (("entry_roles", 2), ("tools", 3), ("skills_required", 5), ("interview_prep", 5),
                       ("learning_resources", 3), ("keywords", 8), ("portfolio_expectations", 3),
                       ("career_progression", 3)):
        if not isinstance(career[field], list) or len(career[field]) < low:
            problems.append(f"{slug}: {field} needs at least {low} items")
    for field in ("summary", "beginner_summary", "earning_notes", "who_its_for"):
        if not _nonempty_str(career[field]) or len(career[field]) < 40:
            problems.append(f"{slug}: {field} is missing or too thin")
    if len(career["summary"]) > 320:
        problems.append(f"{slug}: summary is over 320 characters, it must scan in a list")
    for res in career["learning_resources"]:
        if not (isinstance(res, dict) and _nonempty_str(res.get("label")) and _nonempty_str(res.get("note"))):
            problems.append(f"{slug}: every learning resource needs a label and a note")
    outline = career["roadmap_outline"]
    for tier in ("beginner", "intermediate", "advanced"):
        steps = outline.get(tier) if isinstance(outline, dict) else None
        if not isinstance(steps, list) or len(steps) < 4:
            problems.append(f"{slug}: roadmap_outline.{tier} needs at least 4 steps")
    problems += check_text(slug, {k: career[k] for k in REQUIRED_CAREER_FIELDS + REQUIRED_META_FIELDS if k != "icon"})
    return problems


def check_roadmap(slug: str, content: dict) -> list[str]:
    """Problems with one light roadmap: skills, three tiered phases, one project each."""
    problems: list[str] = []
    skills = content.get("skills") or []
    keys = [s.get("key") for s in skills]
    if len(skills) < 4:
        problems.append(f"{slug}: needs at least 4 skills")
    if len(set(keys)) != len(keys):
        problems.append(f"{slug}: duplicate skill keys")
    for s in skills:
        if s.get("category") not in SKILL_CATEGORIES or not _nonempty_str(s.get("label")) or not _nonempty_str(s.get("key")):
            problems.append(f"{slug}: bad skill {s!r}")
    for a, b in content.get("skill_edges") or []:
        if a not in keys or b not in keys:
            problems.append(f"{slug}: skill edge {a}->{b} names an unknown skill")
    if not content.get("skill_edges"):
        problems.append(f"{slug}: needs skill_edges")

    phases = content.get("phases") or []
    if tuple(p.get("title") for p in phases[:3]) != PHASE_TITLES:
        problems.append(f"{slug}: phases must start with {PHASE_TITLES}")
    tiers = []
    for phase in phases:
        if not _nonempty_str(phase.get("summary")) or len(phase["summary"]) < 60:
            problems.append(f"{slug}: phase {phase.get('title')!r} needs a real summary")
        if phase.get("skill_key") not in keys:
            problems.append(f"{slug}: phase {phase.get('title')!r} skill_key is not a skill of this career")
        for project in phase.get("projects") or []:
            label = f"{slug}/{project.get('title', '?')[:40]}"
            for f in PROJECT_FIELDS:
                if f not in project:
                    problems.append(f"{label}: missing {f}")
            if any(f not in project for f in PROJECT_FIELDS):
                continue
            tiers.append(project["difficulty"])
            if len(project["title"]) > 190:
                problems.append(f"{label}: title too long")
            if len(project["steps"]) < 6:
                problems.append(f"{label}: needs at least 6 steps")
            if len(project["hints"]) < 3:
                problems.append(f"{label}: needs at least 3 hints")
            if len(project["common_mistakes"]) < 3:
                problems.append(f"{label}: needs at least 3 common mistakes")
            if len(project["prerequisites"]) < 1:
                problems.append(f"{label}: needs prerequisites")
            if len(project["expected_output"]) < 60 or len(project["teaches"]) < 30:
                problems.append(f"{label}: teaches or expected_output is too thin")
            if not isinstance(project["difficulty"], int):
                problems.append(f"{label}: difficulty must be an int")
    if tiers[:3] != list(PROJECT_TIERS):
        problems.append(f"{slug}: project difficulties must be {PROJECT_TIERS} in phase order, got {tiers[:3]}")
    problems += check_text(slug + "/roadmap", content, prose=False)
    return problems


def _norm(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", "", text.lower()).strip()


def check_distinct(careers: list[dict], roadmaps: dict[str, dict]) -> list[str]:
    """Nothing may be copied between careers: not a project, not a roadmap step,
    not an interview question, not a portfolio item, not a summary."""
    problems: list[str] = []
    seen: dict[tuple[str, str], str] = {}

    def claim(kind: str, text: str, slug: str) -> None:
        key = (kind, _norm(text))
        if not key[1]:
            return
        other = seen.get(key)
        if other and other != slug:
            problems.append(f"{slug} repeats a {kind} from {other}: {text[:70]!r}")
        else:
            seen[key] = slug

    for c in careers:
        slug = c["slug"]
        claim("summary", c["summary"], slug)
        for tier, steps in c["roadmap_outline"].items():
            for step in steps:
                claim("roadmap step", step, slug)
        for q in c["interview_prep"]:
            claim("interview question", q, slug)
        for item in c["portfolio_expectations"]:
            claim("portfolio item", item, slug)
    for slug, content in roadmaps.items():
        for phase in content.get("phases", []):
            for project in phase.get("projects", []):
                claim("project", project["title"], slug)
    return problems


def check_catalogue(careers: list[dict], roadmaps: dict[str, dict], light_only: Iterable[str] | None = None) -> list[str]:
    """All problems across a set of careers. `light_only` names the careers whose
    roadmap is the light three-phase kind (the two full curricula are checked elsewhere)."""
    problems: list[str] = []
    slugs = [c["slug"] for c in careers]
    if len(set(slugs)) != len(slugs):
        problems.append("duplicate career slugs")
    names = [c["name"].lower() for c in careers]
    if len(set(names)) != len(names):
        problems.append("duplicate career names")
    for c in careers:
        problems += check_career(c)
    check = set(light_only) if light_only is not None else set(roadmaps)
    for slug in check:
        if slug in roadmaps:
            problems += check_roadmap(slug, roadmaps[slug])
        else:
            problems.append(f"{slug}: has no roadmap content")
    problems += check_distinct(careers, roadmaps)
    return problems
