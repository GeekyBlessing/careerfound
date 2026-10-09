"""Career catalogue taxonomy: categories, legacy slugs and redirects.

A *category* is a way to filter and group the catalogue. It is never a career.
A career path has exactly one category and a clean name of its own, so nothing
reads like "Cybersecurity Security". The category source of truth for the
frontend lives in frontend/src/lib/career-categories.ts, and a backend test
keeps the two in sync.
"""

from __future__ import annotations

# (slug, label, short blurb) in display order.
CATEGORIES: list[tuple[str, str, str]] = [
    ("engineering", "Software Engineering", "Build software for the web, phones, games and devices."),
    ("cloud-infrastructure", "Cloud, Infrastructure & DevOps", "Run, ship and design the platforms software lives on."),
    ("security", "Cybersecurity", "Protect systems, detect threats and test defences."),
    ("data-ai", "Data & Artificial Intelligence", "Turn data into decisions, pipelines, models and AI products."),
    ("design-product", "Design & Product", "Shape what gets built and how it looks, feels and works."),
    ("operations-digital", "IT, Automation & Technical Communication", "Support teams, automate work and explain technical ideas."),
]

CATEGORY_SLUGS: list[str] = [slug for slug, _label, _blurb in CATEGORIES]
CATEGORY_LABELS: dict[str, str] = {slug: label for slug, label, _blurb in CATEGORIES}

# Old slug -> current slug. Old career URLs and stored references (saved
# roadmaps, assessment results, mentor tags, ?path= links) keep working.
LEGACY_SLUG_REDIRECTS: dict[str, str] = {
    "ai-ml-engineering": "ai-engineering",
    "no-code-automation": "workflow-automation",
    "soc-analysis": "security-operations",
    "devops": "devops-engineering",
}


def canonical_slug(slug: str) -> str:
    """Map a legacy career slug to its current slug (unchanged if current)."""
    return LEGACY_SLUG_REDIRECTS.get(slug, slug)


def slug_matches(candidate: str, wanted: str) -> bool:
    """True when two slugs name the same career, old or new spelling."""
    return canonical_slug(candidate) == canonical_slug(wanted)


def category_label(category: str | None) -> str:
    return CATEGORY_LABELS.get(category or "", "")
