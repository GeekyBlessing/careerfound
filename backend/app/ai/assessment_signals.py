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
        "Working out why something is broken",
        {"cybersecurity": 4, "security-operations": 4, "penetration-testing": 4, "backend-engineering": 4,
         "software-engineering": 4, "qa-engineering": 6},
    ),
    "interfaces": (
        "Making something clear and pleasant to use",
        {"frontend-development": 7, "ui-ux-design": 7, "product-design": 6, "graphic-design": 5,
         "mobile-development": 4, "full-stack-development": 3},
    ),
    "data": (
        "Spotting patterns in numbers",
        {"data-analysis": 8, "data-science": 7, "data-engineering": 5, "ai-engineering": 4},
    ),
    "apps": (
        "Building something people use",
        {"mobile-development": 6, "full-stack-development": 6, "software-engineering": 5,
         "frontend-development": 4, "backend-engineering": 4},
    ),
    "security": (
        "Protecting systems or testing how they break",
        {"cybersecurity": 8, "penetration-testing": 6, "security-operations": 6, "cloud-security": 6},
    ),
    "infrastructure": (
        "Setting up what software runs on",
        {"cloud-engineering": 8, "devops-engineering": 7, "solutions-architecture": 5,
         "cloud-security": 4, "data-engineering": 3},
    ),
    "ai": (
        "Teaching software to recognise or predict things",
        {"ai-engineering": 7, "data-science": 6, "data-engineering": 3},
    ),
    "writing": (
        "Explaining complicated things simply",
        {"technical-writing": 8, "product-management": 3, "it-support": 2},
    ),
    "people": (
        "Helping people get unstuck",
        {"it-support": 6, "product-management": 6, "solutions-architecture": 3, "product-design": 3},
    ),
    "visual": (
        "Making things look striking",
        {"graphic-design": 9, "motion-design": 5, "ui-ux-design": 3, "product-design": 2, "frontend-development": 2},
    ),
    "automation": (
        "Making repetitive work run itself",
        {"workflow-automation": 10, "devops-engineering": 4, "qa-engineering": 4, "it-support": 2},
    ),
}

# What the person already brings with them.
STRENGTHS: dict[str, tuple[str, dict[str, int]]] = {
    "logic": (
        "Thinking things through in order",
        {"software-engineering": 3, "backend-engineering": 3, "cybersecurity": 3, "data-engineering": 2,
         "ai-engineering": 2},
    ),
    "creativity": (
        "Coming up with ideas",
        {"ui-ux-design": 4, "graphic-design": 4, "product-design": 4, "frontend-development": 3},
    ),
    "communication": (
        "Putting things clearly",
        {"technical-writing": 4, "product-management": 4, "it-support": 3, "solutions-architecture": 3},
    ),
    "detail": (
        "Noticing small mistakes",
        {"qa-engineering": 7, "data-analysis": 3, "cybersecurity": 3, "security-operations": 3,
         "technical-writing": 2},
    ),
    "numbers": (
        "Being at ease with figures",
        {"data-analysis": 4, "data-science": 4, "ai-engineering": 3, "data-engineering": 2},
    ),
    "patience": (
        "Sticking with something hard",
        {"penetration-testing": 3, "backend-engineering": 3, "security-operations": 3, "devops-engineering": 2},
    ),
    "organising": (
        "Keeping people and work on track",
        {"product-management": 5, "solutions-architecture": 3, "it-support": 2},
    ),
    "teaching": (
        "Helping others understand",
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
    for key, table in (
        ("things_enjoyed", INTERESTS),
        ("existing_skills", STRENGTHS),
        ("tech_interests", TECH_INTERESTS),
        ("problem_styles", PROBLEM_STYLES),
    ):
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
    out: dict[str, list[str]] = {"interests": [], "strengths": [], "technology": [], "styles": []}
    for key, table, bucket in (
        ("things_enjoyed", INTERESTS, "interests"),
        ("existing_skills", STRENGTHS, "strengths"),
        ("tech_interests", TECH_INTERESTS, "technology"),
        ("problem_styles", PROBLEM_STYLES, "styles"),
    ):
        for tag in _ids(profile, key):
            entry = table.get(tag)
            if entry and entry[1].get(slug, 0) >= 3:
                out[bucket].append(entry[0])
    return out


# How the person likes to work a problem out. These describe a preference for
# a way of working, not skill at it. Boosts are small, like every other table.
PROBLEM_STYLES: dict[str, tuple[str, dict[str, int]]] = {
    "trace": (
        "Trace it step by step until I find the cause",
        {"cybersecurity": 2, "detection-engineering": 4, "digital-forensics-incident-response": 4,
         "site-reliability-engineering": 4, "qa-engineering": 4, "technical-support-engineering": 3,
         "penetration-testing": 3, "security-operations": 3, "backend-engineering": 2, "software-engineering": 2,
         "application-security": 3, "embedded-systems-engineering": 3},
    ),
    "sketch": (
        "Sketch a few different ways to fix it",
        {"graphic-design": 3, "ui-ux-design": 3, "product-design": 3, "motion-design": 3, "game-development": 3,
         "frontend-development": 2, "no-code-development": 2},
    ),
    "ask": (
        "Talk to the people affected to see what they need",
        {"ux-research": 5, "business-analysis": 5, "product-management": 4, "solutions-consulting": 4,
         "it-support": 3, "technical-support-engineering": 3, "product-design": 3, "identity-access-management": 3,
         "it-service-management": 3, "governance-risk-compliance": 2},
    ),
    "map": (
        "Map how the parts connect before touching anything",
        {"security-engineering": 5, "platform-engineering": 4, "solutions-architecture": 4, "network-engineering": 4,
         "cloud-engineering": 3, "identity-access-management": 4, "data-engineering": 3, "devops-engineering": 3,
         "systems-administration": 3, "cloud-security": 3, "database-administration": 2},
    ),
    "measure": (
        "Measure what is happening and read the numbers",
        {"data-analysis": 4, "data-science": 4, "business-intelligence-engineering": 4,
         "analytics-engineering": 4, "machine-learning-engineering": 3, "site-reliability-engineering": 2,
         "detection-engineering": 2, "database-administration": 2},
    ),
}

# How the person likes to learn. It does not change which careers rank; it
# changes how a result suggests starting.
LEARNING_STYLES: dict[str, tuple[str, str]] = {
    "building": (
        "By building something and fixing it as it breaks",
        "You said you learn by building, so open the first project early and learn the lessons as the project asks for them.",
    ),
    "guided": (
        "By following a clear path, one step after another",
        "You said you like a clear path, so work through the roadmap in order and let the first project follow the first phase.",
    ),
    "reading": (
        "By reading and understanding before I try",
        "You said you like to understand before you try, so read the first phase through once, then use the first project to test what you took in.",
    ),
    "people": (
        "By talking it through with other people",
        "You said you learn by talking things through, so pair the first phase with a mentor session or a study partner.",
    ),
}

# Why a strength carries over, shown only for careers that the strength
# actually points toward. Written about the strength, so it stays true for
# every career it is shown beside.
STRENGTH_NOTES: dict[str, str] = {
    "logic": "Working through a problem in order is how bugs, incidents and bad data get traced to a cause.",
    "creativity": "Most roles in this field involve choosing between options, and trying a different angle is how you find a better one.",
    "communication": "Findings, designs and decisions only matter once someone else understands them.",
    "detail": "Small mistakes are expensive in this kind of work, and careful checking is how they get caught.",
    "numbers": "Being at ease with figures makes measuring, comparing and checking results far less tiring.",
    "patience": "Hard problems in this field often take hours of dead ends before they give way.",
    "organising": "Keeping people, tasks and deadlines in order is a daily part of the job.",
    "teaching": "Explaining something simply is how you support users, colleagues and clients.",
}

# What a working-style answer means in a sentence, keyed by the profile flag.
TRAIT_PHRASES: dict[str, str] = {
    "enjoys_problem_solving": "you like working out why something goes wrong",
    "enjoys_math": "you like working with numbers and measurements",
    "enjoys_creativity": "you like coming up with different ways to do things",
    "enjoys_people": "you like working with and for people",
    "prefers_systems": "you like working with systems and tools",
    "risk_tolerant": "you are comfortable with fast, high stakes work",
}

# Which answers support each Career DNA axis. The DNA describes what the
# person leaned toward in their own answers, not how good they are at it.
DNA_AXES: dict[str, dict[str, tuple[str, ...]]] = {
    "problem_solving": {"interests": ("puzzles", "security", "automation"), "strengths": ("logic", "patience"), "styles": ("trace",)},
    "mathematics": {"interests": ("data", "ai"), "strengths": ("numbers",), "styles": ("measure",)},
    "creativity": {"interests": ("interfaces", "visual", "writing"), "strengths": ("creativity",), "styles": ("sketch",)},
    "people_orientation": {"interests": ("people",), "strengths": ("communication", "teaching", "organising"), "styles": ("ask",)},
    "systems_thinking": {"interests": ("infrastructure", "automation", "security"), "strengths": ("detail",), "styles": ("map",)},
    "communication": {"interests": ("writing", "people"), "strengths": ("communication", "teaching"), "styles": ()},
}


def fit_reasons(profile: dict[str, Any], slug: str, trait_rule: dict[str, int]) -> list[str]:
    """Working-style answers that this career's scoring actually weighs."""
    out = []
    for trait, phrase in TRAIT_PHRASES.items():
        if profile.get(trait) and trait_rule.get(trait, 0) > 0:
            out.append(phrase)
    return out
