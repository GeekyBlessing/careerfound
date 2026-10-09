"""Careers added in the catalogue restructure, one module per group.

Each module exports CAREERS (career dicts without category or related
careers), META (keywords, who_its_for, portfolio_expectations,
career_progression) and PROJECTS (the light three-phase roadmap). This file
merges them and says which category each belongs to; related careers live in
career_catalogue_meta.EDGES with the rest of the relationships.
"""

from app.seed.new_careers import cloud_a, cloud_b, data, design, it, security_a, security_b, software

_MODULES = (software, cloud_a, cloud_b, security_a, security_b, data, design, it)

CATEGORY_BY_SLUG: dict[str, str] = {
    "game-development": "engineering",
    "embedded-systems-engineering": "engineering",
    "site-reliability-engineering": "cloud-infrastructure",
    "platform-engineering": "cloud-infrastructure",
    "systems-administration": "cloud-infrastructure",
    "network-engineering": "cloud-infrastructure",
    "database-administration": "cloud-infrastructure",
    "application-security": "security",
    "digital-forensics-incident-response": "security",
    "security-engineering": "security",
    "identity-access-management": "security",
    "governance-risk-compliance": "security",
    "detection-engineering": "security",
    "business-intelligence-engineering": "data-ai",
    "machine-learning-engineering": "data-ai",
    "mlops-engineering": "data-ai",
    "analytics-engineering": "data-ai",
    "motion-design": "design-product",
    "business-analysis": "design-product",
    "ux-research": "design-product",
    "it-service-management": "operations-digital",
    "no-code-development": "operations-digital",
    "solutions-consulting": "operations-digital",
    "technical-support-engineering": "operations-digital",
}

NEW_CAREERS: list[dict] = [dict(c) for m in _MODULES for c in m.CAREERS]
NEW_META: dict[str, dict] = {slug: dict(meta) for m in _MODULES for slug, meta in m.META.items()}
NEW_PROJECTS: dict[str, dict] = {slug: content for m in _MODULES for slug, content in m.PROJECTS.items()}

assert set(CATEGORY_BY_SLUG) == {c["slug"] for c in NEW_CAREERS} == set(NEW_META) == set(NEW_PROJECTS), \
    "new_careers modules and CATEGORY_BY_SLUG disagree"
