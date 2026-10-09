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
         "software-engineering": 4, "qa-engineering": 6},
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
        {"ai-engineering": 7, "data-science": 6, "data-engineering": 3},
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
        {"workflow-automation": 10, "devops-engineering": 4, "qa-engineering": 4, "it-support": 2},
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
        {"qa-engineering": 7, "data-analysis": 3, "cybersecurity": 3, "security-operations": 3,
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
    "automation": ("Automation and no-code", {"workflow-automation": 9, "no-code-development": 6,
                                                "devops-engineering": 3, "it-support": 2}),
}

# The careers added in the catalogue restructure. Kept as additions to the
# tables above so each answer id still reads as one idea with one list of
# careers it points toward.
_MORE: dict[str, dict[str, dict[str, int]]] = {
    "puzzles": {"application-security": 4, "detection-engineering": 4, "digital-forensics-incident-response": 4,
                "site-reliability-engineering": 4, "technical-support-engineering": 3, "game-development": 3,
                "embedded-systems-engineering": 3, "machine-learning-engineering": 3},
    "interfaces": {"motion-design": 6, "ux-research": 3, "no-code-development": 4, "game-development": 3},
    "data": {"business-intelligence-engineering": 7, "analytics-engineering": 7, "machine-learning-engineering": 6,
             "mlops-engineering": 3, "database-administration": 3, "business-analysis": 3},
    "apps": {"game-development": 5, "no-code-development": 5, "embedded-systems-engineering": 3},
    "security": {"application-security": 6, "digital-forensics-incident-response": 6, "security-engineering": 6,
                 "identity-access-management": 5, "governance-risk-compliance": 5, "detection-engineering": 6},
    "infrastructure": {"site-reliability-engineering": 6, "platform-engineering": 6, "systems-administration": 7,
                       "network-engineering": 7, "database-administration": 6, "mlops-engineering": 3,
                       "embedded-systems-engineering": 3},
    "ai": {"machine-learning-engineering": 8, "mlops-engineering": 6, "analytics-engineering": 2},
    "writing": {"business-analysis": 3, "ux-research": 3, "solutions-consulting": 3, "governance-risk-compliance": 2},
    "people": {"it-service-management": 6, "technical-support-engineering": 6, "solutions-consulting": 6,
               "business-analysis": 6, "ux-research": 6, "identity-access-management": 2},
    "automation": {"workflow-automation": 2, "no-code-development": 4, "mlops-engineering": 3,
                   "platform-engineering": 3, "site-reliability-engineering": 3, "systems-administration": 3},
    "logic": {"application-security": 3, "detection-engineering": 3, "machine-learning-engineering": 3,
              "analytics-engineering": 2, "embedded-systems-engineering": 3, "game-development": 2},
    "creativity": {"motion-design": 4, "game-development": 3, "ux-research": 2, "no-code-development": 2},
    "communication": {"business-analysis": 4, "solutions-consulting": 4, "ux-research": 4, "it-service-management": 3,
                      "technical-support-engineering": 3, "governance-risk-compliance": 3},
    "detail": {"governance-risk-compliance": 4, "database-administration": 4, "digital-forensics-incident-response": 4,
               "identity-access-management": 3, "business-intelligence-engineering": 3, "analytics-engineering": 3},
    "numbers": {"business-intelligence-engineering": 4, "analytics-engineering": 4, "machine-learning-engineering": 4,
                "database-administration": 2},
    "patience": {"digital-forensics-incident-response": 3, "detection-engineering": 3, "systems-administration": 3,
                 "site-reliability-engineering": 3, "embedded-systems-engineering": 3, "network-engineering": 2},
    "organising": {"business-analysis": 4, "it-service-management": 4, "governance-risk-compliance": 4,
                   "solutions-consulting": 3, "ux-research": 2},
    "teaching": {"solutions-consulting": 3, "technical-support-engineering": 3, "ux-research": 2},
}
_MORE_TECH: dict[str, dict[str, int]] = {
    "web": {"no-code-development": 3},
    "mobile": {"game-development": 3},
    "cloud": {"site-reliability-engineering": 5, "platform-engineering": 5, "systems-administration": 3,
              "network-engineering": 4, "database-administration": 3, "mlops-engineering": 3},
    "ai": {"machine-learning-engineering": 7, "mlops-engineering": 5},
    "security": {"application-security": 5, "security-engineering": 5, "detection-engineering": 5,
                 "digital-forensics-incident-response": 5, "identity-access-management": 4,
                 "governance-risk-compliance": 3},
    "data": {"business-intelligence-engineering": 5, "analytics-engineering": 5, "database-administration": 4,
             "machine-learning-engineering": 3},
    "design": {"motion-design": 5, "ux-research": 3, "no-code-development": 2},
}
for _tag, _more in _MORE.items():
    for _table in (INTERESTS, STRENGTHS):
        if _tag in _table:
            _table[_tag][1].update(_more)
for _tag, _more in _MORE_TECH.items():
    TECH_INTERESTS[_tag][1].update(_more)

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
