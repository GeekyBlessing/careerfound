"""Signals from the "Discover Your Direction" journey, and how they move a
career's score.

The journey asks about interests, strengths, working style, goals and
technology preferences. Each multi-choice answer is a short id (the frontend
sends these in `things_enjoyed`, `existing_skills` and `tech_interests`).
This module owns the id vocabulary: what each id is called in plain English
and which careers it points toward, so the scorer and the result copy both
read from one table.

Boosts are small and capped. They nudge the ranking between careers that the
older trait flags (problem solving, math, creativity, people, systems) score
close together, instead of overriding them.
"""
from __future__ import annotations

from typing import Any

# Activities the person says they lose track of time doing.
INTERESTS: dict[str, tuple[str, dict[str, int]]] = {
    "puzzles": (
        "Solving puzzles and debugging",
        {"cybersecurity": 4, "security-operations": 4, "penetration-testing": 4, "backend-engineering": 4,
         "software-engineering": 4, "qa-engineering": 4},
    ),
    "interfaces": (
        "Designing how things look and feel",
        {"frontend-development": 7, "ui-ux-design": 7, "product-design": 6, "graphic-design": 5,
         "mobile-development": 4, "full-stack-development": 3},
    ),
    "data": (
        "Finding patterns in numbers",
        {"data-analysis": 8, "data-science": 7, "data-engineering": 5, "ai-engineering": 4},
    ),
    "apps": (
        "Building things people use",
        {"mobile-development": 6, "full-stack-development": 6, "software-engineering": 5,
         "frontend-development": 4, "backend-engineering": 4},
    ),
    "security": (
        "Protecting systems, or testing how they break",
        {"cybersecurity": 8, "penetration-testing": 6, "security-operations": 6, "cloud-security": 6},
    ),
    "infrastructure": (
        "Setting up the servers and systems behind software",
        {"cloud-engineering": 8, "devops-engineering": 7, "solutions-architecture": 5,
         "cloud-security": 4, "data-engineering": 3},
    ),
    "ai": (
        "Teaching machines to do useful things",
        {"ai-engineering": 8, "data-science": 6, "data-engineering": 3},
    ),
    "writing": (
        "Explaining complicated ideas clearly",
        {"technical-writing": 8, "product-management": 3, "it-support": 2},
    ),
    "people": (
        "Helping people and untangling their problems",
        {"it-support": 6, "product-management": 6, "solutions-architecture": 3, "product-design": 3},
    ),
    "automation": (
        "Automating repetitive work",
        {"no-code-automation": 8, "devops-engineering": 5, "qa-engineering": 4, "it-support": 2},
    ),
}

# What the person already brings with them.
STRENGTHS: dict[str, tuple[str, dict[str, int]]] = {
    "logic": (
        "Logical thinking",
        {"software-engineering": 3, "backend-engineering": 3, "cybersecurity": 3, "data-engineering": 2,
         "ai-engineering": 2},
    ),
    "creativity": (
        "Creativity",
        {"ui-ux-design": 4, "graphic-design": 4, "product-design": 4, "frontend-development": 3},
    ),
    "communication": (
        "Communication",
        {"technical-writing": 4, "product-management": 4, "it-support": 3, "solutions-architecture": 3},
    ),
    "detail": (
        "Attention to detail",
        {"qa-engineering": 5, "data-analysis": 3, "cybersecurity": 3, "security-operations": 3,
         "technical-writing": 2},
    ),
    "numbers": (
        "Comfort with numbers",
        {"data-analysis": 4, "data-science": 4, "ai-engineering": 3, "data-engineering": 2},
    ),
    "patience": (
        "Patience with hard problems",
        {"penetration-testing": 3, "backend-engineering": 3, "security-operations": 3, "devops-engineering": 2},
    ),
    "organising": (
        "Organising people and work",
        {"product-management": 5, "solutions-architecture": 3, "it-support": 2},
    ),
    "teaching": (
        "Explaining things to others",
        {"technical-writing": 3, "product-management": 3, "it-support": 3},
    ),
}

# Parts of technology the person is drawn to.
TECH_INTERESTS: dict[str, tuple[str, dict[str, int]]] = {
    "web": ("Websites and web apps", {"frontend-development": 5, "backend-engineering": 4,
                                      "full-stack-development": 6, "software-engineering": 3}),
    "mobile": ("Mobile apps", {"mobile-development": 8, "software-engineering": 2}),
    "cloud": ("Cloud and infrastructure", {"cloud-engineering": 7, "devops-engineering": 5,
                                           "cloud-security": 4, "solutions-architecture": 4}),
    "ai": ("AI and machine learning", {"ai-engineering": 7, "data-science": 5}),
    "security": ("Security", {"cybersecurity": 6, "penetration-testing": 4, "security-operations": 4,
                              "cloud-security": 4}),
    "data": ("Data and analytics", {"data-analysis": 6, "data-science": 4, "data-engineering": 5}),
    "design": ("Design tools", {"ui-ux-design": 6, "product-design": 5, "graphic-design": 5}),
    "automation": ("Automation and no-code", {"no-code-automation": 7, "devops-engineering": 3,
                                                "it-support": 2}),
}

# Cap so a long list of ticked boxes can nudge, never decide, the ranking.
MAX_SIGNAL_BONUS = 20
CATEGORY_BONUS = 10


def _ids(profile: dict[str, Any], key: str) -> list[str]:
    value = profile.get(key) or []
    return [v for v in value if isinstance(v, str)]


def signal_bonus(profile: dict[str, Any], slug: str, category: str | None = None) -> int:
    total = 0
    for key, table in (("things_enjoyed", INTERESTS), ("existing_skills", STRENGTHS), ("tech_interests", TECH_INTERESTS)):
        for tag in _ids(profile, key):
            entry = table.get(tag)
            if entry:
                total += entry[1].get(slug, 0)
    total = min(total, MAX_SIGNAL_BONUS)
    preferred = profile.get("preferred_category")
    if preferred and category and preferred == category:
        total += CATEGORY_BONUS
    return total


def matched_labels(profile: dict[str, Any], slug: str) -> dict[str, list[str]]:
    """Plain-English labels of the person's own answers that point at this
    career, grouped as interests / strengths / technology."""
    out: dict[str, list[str]] = {"interests": [], "strengths": [], "technology": []}
    for key, table, bucket in (
        ("things_enjoyed", INTERESTS, "interests"),
        ("existing_skills", STRENGTHS, "strengths"),
        ("tech_interests", TECH_INTERESTS, "technology"),
    ):
        for tag in _ids(profile, key):
            entry = table.get(tag)
            if entry and entry[1].get(slug, 0) >= 3:
                out[bucket].append(entry[0])
    return out
