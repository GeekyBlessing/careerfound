"""How deep a career's learning content goes today.

Only two careers have a complete lesson, quiz and exercise curriculum
(cybersecurity and software engineering); the Project Lab (job-ready projects
with guided submissions and review) exists for cybersecurity. Every other
career has a stage by stage roadmap and three graded projects. The product
says so on the career page instead of implying more.
"""

from __future__ import annotations

FULL_CURRICULUM_SLUGS = frozenset({"cybersecurity", "software-engineering"})


def content_depth(slug: str) -> str:
    return "full" if slug in FULL_CURRICULUM_SLUGS else "guided"


def has_project_lab(slug: str) -> bool:
    from app.seed.lab import LAB_CURRICULA

    return slug in LAB_CURRICULA
