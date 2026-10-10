"""
LLMClient interface + two implementations:

- MockLLMProvider: default. Produces realistic, personalized, structured
  responses using deterministic heuristics over the actual input (not static
  canned text) so every AI feature is genuinely demoable end-to-end with zero
  external calls, zero cost, and zero API key.
- AnthropicProvider: real integration point. Activated by setting
  LLM_PROVIDER=anthropic and ANTHROPIC_API_KEY in the environment. No other
  file in the codebase needs to change when this happens.

Both implementations satisfy the same abstract interface, so routers/services
never know or care which one is active.
"""
from __future__ import annotations

import abc
import logging
import json
import random
from typing import Any

from app.ai.prompts import (
    ASSESSMENT_SYSTEM_PROMPT,
    MENTOR_SYSTEM_PROMPT,
    PORTFOLIO_SYSTEM_PROMPT,
    PROJECT_REVIEW_SYSTEM_PROMPT,
    wrap_user_input,
)
from app.ai.schemas import (
    AssessmentResult,
    CareerDNA,
    CareerRecommendation,
    MentorReply,
    PortfolioCopy,
    ProjectReview,
    ProjectReviewFinding,
    SkillTransfer,
)
from app.ai.assessment_signals import (
    DNA_AXES,
    LEARNING_STYLES,
    STRENGTHS,
    STRENGTH_NOTES,
    fit_reasons,
    matched_labels,
    signal_bonus,
)
from app.services.career_taxonomy import CATEGORY_LABELS
from app.core.config import settings
from app.ai.limited_mentor import compose_limited_reply

logger = logging.getLogger("careerfound.ai")


class LLMClient(abc.ABC):
    @abc.abstractmethod
    async def analyze_assessment(
        self, profile: dict[str, Any], career_catalog: list[dict[str, Any]]
    ) -> AssessmentResult: ...

    @abc.abstractmethod
    async def mentor_reply(
        self,
        history: list[dict[str, str]],
        user_message: str,
        user_context: dict[str, Any],
    ) -> MentorReply: ...

    @abc.abstractmethod
    async def review_project(
        self, project_title: str, project_context: dict[str, Any], submission_text: str
    ) -> ProjectReview: ...

    @abc.abstractmethod
    async def generate_portfolio_copy(
        self, project_title: str, project_context: dict[str, Any], submission_text: str
    ) -> PortfolioCopy: ...


# --------------------------------------------------------------------------
# Mock provider, realistic, input-driven, zero external dependency
# --------------------------------------------------------------------------

_BEGINNER_EXPLAINERS = {
    "software-engineering": "building the applications and systems people use every day",
    "frontend-development": "building the part of a website or app people see and click on",
    "backend-engineering": "building the behind-the-scenes systems that power an app",
    "full-stack-development": "building both what people see and what powers it behind the scenes",
    "cloud-engineering": "setting up and running computer systems that live on the internet ('the cloud') instead of one physical machine",
    "cloud-security": "protecting those internet-based systems from attackers",
    "cybersecurity": "protecting computers, networks, and data from people trying to break in",
    "security-operations": "watching over a company's systems in real time and catching attacks as they happen",
    "penetration-testing": "legally breaking into systems on purpose to find weaknesses before criminals do",
    "devops-engineering": "making sure software gets built, tested, and delivered smoothly and reliably",
    "data-analysis": "turning raw numbers into insights that help people make decisions",
    "data-engineering": "building the pipelines that move and organize data so others can use it",
    "ai-engineering": "building applications on top of large language models, with your own data, tools and tests that show they work",
    "data-science": "using statistics and experiments to answer open questions and guide decisions with evidence",
    "graphic-design": "communicating ideas visually through branding, typography and layout",
    "mobile-development": "building the apps people carry in their pocket for iOS and Android",
    "product-design": "shaping how a product looks, feels, and solves a user's problem",
    "ui-ux-design": "designing interfaces that are easy and pleasant for people to use",
    "product-management": "deciding what a product should do next and why",
    "technical-writing": "explaining complex technical things in a way anyone can understand",
    "qa-engineering": "testing software methodically to catch bugs before users do",
    "it-support": "helping people solve everyday computer and technology problems",
    "solutions-architecture": "designing the overall blueprint for how a company's systems fit together",
    "game-development": "building games, from the rules and controls to the graphics and sound",
    "embedded-systems-engineering": "writing the software that runs inside devices such as sensors, wearables and appliances",
    "site-reliability-engineering": "keeping large online services fast and available, and learning from the times they break",
    "platform-engineering": "building the internal tools and paths that let other engineers ship software without fuss",
    "systems-administration": "looking after the servers, accounts and updates that keep a company's computers working",
    "network-engineering": "designing and running the networks that connect offices, servers and the internet",
    "database-administration": "keeping databases fast, safe, backed up and ready to recover",
    "application-security": "finding and fixing security flaws in software before attackers do",
    "digital-forensics-incident-response": "working out what happened after a security incident and helping the business recover",
    "security-engineering": "building the security controls and automation that protect a company's systems",
    "identity-access-management": "deciding who can sign in to what, and making that safe and simple",
    "governance-risk-compliance": "helping a company prove it manages risk and follows security rules and standards",
    "detection-engineering": "writing and tuning the rules that spot attacks in a company's security logs",
    "business-intelligence-engineering": "building the dashboards and reporting models a company runs its decisions on",
    "machine-learning-engineering": "training, testing and serving machine learning models that make predictions",
    "mlops-engineering": "building the pipelines that train, ship and monitor machine learning models reliably",
    "analytics-engineering": "turning raw warehouse data into clean, tested tables that analysts can trust",
    "motion-design": "making graphics move to explain ideas, tell stories and polish products",
    "business-analysis": "working out what a business really needs and writing it down so teams can build it",
    "ux-research": "learning from real users through interviews and tests so teams build the right thing",
    "it-service-management": "running the processes that keep an IT team's tickets, changes and outages under control",
    "no-code-development": "building working websites and apps on visual platforms without writing much code",
    "workflow-automation": "connecting apps so repetitive work happens automatically and reliably",
    "solutions-consulting": "helping customers choose and set up the right technical solution for their problem",
    "technical-support-engineering": "solving the hard technical problems customers hit with a software product",
}


class MockLLMProvider(LLMClient):
    async def analyze_assessment(
        self, profile: dict[str, Any], career_catalog: list[dict[str, Any]]
    ) -> AssessmentResult:
        scored = _score_paths(profile, career_catalog)
        top3 = _pick_top_three(scored)
        tiers = ["best_match", "strong_alternative", "wild_card"]

        recommendations: list[CareerRecommendation] = []
        for (path, score), tier in zip(top3, tiers, strict=False):
            recommendations.append(_build_recommendation(path, score, tier, profile, best=top3[0][0]))

        dna = _build_career_dna(profile)
        return AssessmentResult(career_dna=dna, recommendations=recommendations)

    async def mentor_reply(
        self,
        history: list[dict[str, Any]],
        user_message: str,
        user_context: dict[str, Any],
    ) -> MentorReply:
        """Limited mode: prepared guidance, chosen by what was actually asked.
        See app/ai/limited_mentor.py. Marked mode="limited" so the app can say so."""
        wrap_user_input(user_message)  # injection heuristic runs for logging/telemetry
        return compose_limited_reply(history, user_message, user_context)

    async def review_project(
        self, project_title: str, project_context: dict[str, Any], submission_text: str
    ) -> ProjectReview:
        wrap_user_input(submission_text)
        length = len(submission_text.strip())
        findings: list[ProjectReviewFinding] = []

        if length < 40:
            findings.append(
                ProjectReviewFinding(
                    severity="must_fix",
                    comment=(
                        "This submission is quite short for a full project review, so I can only "
                        "give high-level feedback. Paste your actual code or a fuller description "
                        "of what you built and how, and I'll give you line-level feedback."
                    ),
                )
            )
        else:
            findings.append(
                ProjectReviewFinding(
                    severity="praise",
                    comment=(
                        f"Good structure overall for '{project_title}': it's clear you followed "
                        "the step-by-step guidance rather than skipping to a copy-pasted solution."
                    ),
                )
            )
            if "try" not in submission_text.lower() and "except" not in submission_text.lower() and "error" not in submission_text.lower():
                findings.append(
                    ProjectReviewFinding(
                        severity="should_fix",
                        comment=(
                            "I don't see explicit error handling. What happens if a required input "
                            "is missing or a network call fails? Add a guard for that: it's exactly "
                            "the kind of thing interviewers probe on."
                        ),
                    )
                )
            if "test" not in submission_text.lower():
                findings.append(
                    ProjectReviewFinding(
                        severity="nice_to_have",
                        comment="Consider adding one or two simple tests, even manual test notes in your README count and strengthen your portfolio write-up.",
                    )
                )
            findings.append(
                ProjectReviewFinding(
                    severity="should_fix",
                    comment="Add inline comments explaining *why*, not *what*: reviewers skim for reasoning, not restated code.",
                )
            )

        skills = project_context.get("skills_demonstrated") or [project_context.get("skill_hint", "problem solving")]
        overall = (
            f"Solid attempt at '{project_title}'. You're demonstrating real progress on "
            f"{', '.join(skills[:2]) if skills else 'the core concept'}: a few targeted fixes "
            "below and this is portfolio-ready."
        )
        return ProjectReview(
            overall_assessment=overall,
            findings=findings,
            skills_demonstrated=skills,
            suggested_next_project=project_context.get("next_project_hint", "Move on to the next project in your current phase."),
        )

    async def generate_portfolio_copy(
        self, project_title: str, project_context: dict[str, Any], submission_text: str
    ) -> PortfolioCopy:
        skills = project_context.get("skills_demonstrated") or ["problem solving", "core fundamentals"]
        teaches = project_context.get("teaches", "a core real-world skill for this path")
        skills_str = ", ".join(skills)

        description = (
            f"{project_title}: a self-directed project demonstrating {teaches}. "
            f"Built independently as part of a structured, project-based curriculum, applying "
            f"{skills_str} to a realistic scenario rather than a toy example."
        )
        readme = (
            f"# {project_title}\n\n## Overview\n{description}\n\n## What this demonstrates\n"
            + "\n".join(f"- {s}" for s in skills)
            + "\n\n## How to run it\n_Add your setup/run instructions here._\n\n## What I'd improve next\n_Add 1-2 honest next steps, reviewers value this._\n"
        )
        cv_bullet = (
            f"{_cv_verb(project_title)} {project_title.lower()}, applying {skills[0] if skills else 'core technical skills'} "
            f"to {teaches}."
        )
        linkedin = (
            f"🚀 Just finished building {project_title}! This project let me apply {skills_str} to a real "
            f"scenario, {teaches}. Small step, but exactly the kind of hands-on work I want to keep doing. "
            f"#buildinpublic #tech"
        )
        case_study = (
            f"## {project_title}, Case Study\n\n**Problem:** {teaches}.\n\n**Approach:** "
            f"Broke the problem into steps, applied {skills_str}, and iterated using feedback from "
            f"the AI project reviewer.\n\n**Outcome:** A working, demonstrable project added to my portfolio.\n\n"
            f"**What I'd do differently:** _fill in after reflection._"
        )
        return PortfolioCopy(
            project_description=description,
            readme_draft=readme,
            cv_bullet=cv_bullet,
            linkedin_blurb=linkedin,
            case_study_md=case_study,
            skills_demonstrated=skills,
        )


def _cv_verb(title: str) -> str:
    return random.Random(title).choice(["Developed", "Built", "Engineered", "Designed and implemented", "Created"])


_TRAIT_WEIGHTS: dict[str, dict[str, int]] = {
    "cybersecurity": {"enjoys_problem_solving": 3, "prefers_systems": 3, "enjoys_math": 1},
    "security-operations": {"enjoys_problem_solving": 2, "prefers_systems": 2, "enjoys_people": 1},
    "penetration-testing": {"enjoys_problem_solving": 3, "prefers_systems": 2, "risk_tolerant": 2},
    "cloud-security": {"prefers_systems": 3, "enjoys_problem_solving": 2},
    "software-engineering": {"enjoys_problem_solving": 3, "enjoys_math": 2, "prefers_systems": 2},
    "backend-engineering": {"enjoys_problem_solving": 3, "prefers_systems": 3},
    "frontend-development": {"enjoys_creativity": 3, "enjoys_problem_solving": 2},
    "full-stack-development": {"enjoys_problem_solving": 2, "enjoys_creativity": 2, "prefers_systems": 2},
    "devops-engineering": {"prefers_systems": 3, "enjoys_problem_solving": 2},
    "cloud-engineering": {"prefers_systems": 3, "enjoys_math": 1},
    "data-analysis": {"enjoys_math": 3, "enjoys_problem_solving": 2},
    "data-engineering": {"enjoys_math": 2, "prefers_systems": 3},
    "ai-engineering": {"enjoys_problem_solving": 3, "enjoys_math": 2, "prefers_systems": 1},
    "data-science": {"enjoys_math": 3, "enjoys_problem_solving": 2, "enjoys_creativity": 1},
    "mobile-development": {"enjoys_creativity": 2, "enjoys_problem_solving": 2, "enjoys_people": 1},
    "graphic-design": {"enjoys_creativity": 3, "enjoys_people": 1},
    "product-design": {"enjoys_creativity": 2, "enjoys_people": 2, "enjoys_problem_solving": 2},
    "ui-ux-design": {"enjoys_creativity": 3, "enjoys_people": 2},
    "product-management": {"enjoys_people": 3, "enjoys_problem_solving": 1},
    "technical-writing": {"enjoys_people": 2, "enjoys_creativity": 1},
    "qa-engineering": {"enjoys_problem_solving": 2, "prefers_systems": 1},
    "it-support": {"enjoys_people": 3, "prefers_systems": 1},
    "solutions-architecture": {"prefers_systems": 3, "enjoys_people": 2, "enjoys_problem_solving": 1},
    "game-development": {"enjoys_creativity": 3, "enjoys_problem_solving": 2, "enjoys_math": 1},
    "embedded-systems-engineering": {"prefers_systems": 3, "enjoys_problem_solving": 2, "enjoys_math": 2},
    "site-reliability-engineering": {"prefers_systems": 3, "enjoys_problem_solving": 3, "risk_tolerant": 1},
    "platform-engineering": {"prefers_systems": 3, "enjoys_problem_solving": 2, "enjoys_people": 1},
    "systems-administration": {"prefers_systems": 3, "enjoys_problem_solving": 2, "enjoys_people": 1},
    "network-engineering": {"prefers_systems": 3, "enjoys_problem_solving": 2, "enjoys_math": 1},
    "database-administration": {"prefers_systems": 3, "enjoys_math": 1, "enjoys_problem_solving": 1},
    "application-security": {"enjoys_problem_solving": 3, "prefers_systems": 2, "enjoys_creativity": 1},
    "digital-forensics-incident-response": {"enjoys_problem_solving": 3, "risk_tolerant": 1, "enjoys_people": 1},
    "security-engineering": {"prefers_systems": 3, "enjoys_problem_solving": 2, "enjoys_math": 1},
    "identity-access-management": {"prefers_systems": 2, "enjoys_people": 2, "enjoys_problem_solving": 1},
    "governance-risk-compliance": {"enjoys_people": 3, "enjoys_problem_solving": 1},
    "detection-engineering": {"enjoys_problem_solving": 3, "prefers_systems": 2, "enjoys_math": 1},
    "business-intelligence-engineering": {"enjoys_math": 2, "prefers_systems": 2, "enjoys_people": 1},
    "machine-learning-engineering": {"enjoys_math": 3, "enjoys_problem_solving": 3, "prefers_systems": 1},
    "mlops-engineering": {"prefers_systems": 3, "enjoys_problem_solving": 2, "enjoys_math": 1},
    "analytics-engineering": {"enjoys_math": 2, "prefers_systems": 2, "enjoys_problem_solving": 2},
    "motion-design": {"enjoys_creativity": 3, "enjoys_people": 1},
    "business-analysis": {"enjoys_people": 3, "enjoys_problem_solving": 2},
    "ux-research": {"enjoys_people": 3, "enjoys_creativity": 1, "enjoys_problem_solving": 1},
    "it-service-management": {"enjoys_people": 2, "prefers_systems": 2},
    "no-code-development": {"enjoys_creativity": 2, "enjoys_problem_solving": 2, "enjoys_people": 1},
    "workflow-automation": {"enjoys_problem_solving": 3, "prefers_systems": 1, "enjoys_creativity": 1},
    "solutions-consulting": {"enjoys_people": 3, "enjoys_problem_solving": 2, "prefers_systems": 1},
    "technical-support-engineering": {"enjoys_problem_solving": 3, "enjoys_people": 2, "prefers_systems": 1},
}


def _score_paths(profile: dict[str, Any], career_catalog: list[dict[str, Any]]) -> list[tuple[dict, int]]:
    """Deterministic heuristic scorer over the profile vector. Mirrors the
    declarative `path_fit_rules` table in spirit, this mock keeps the logic
    inline so the assessment is demoable without seed data being present.
    """
    weights = _TRAIT_WEIGHTS

    scored = []
    for path in career_catalog:
        slug = path["slug"]
        rule = weights.get(slug, {"enjoys_problem_solving": 1})
        score = 50
        for trait, weight in rule.items():
            if profile.get(trait):
                score += weight * 8
        score += signal_bonus(profile, slug, path.get("category"))
        scored.append((path, score))

    # Rank on the raw score so strong specialist matches are not flattened into
    # a tie at 100 by a long list of ticked answers, then show a 0 to 100 fit
    # that keeps the order (equal displayed scores would read as a coin toss).
    scored.sort(key=lambda t: (-t[1], t[0]["slug"]))
    shown: list[tuple[dict, int]] = []
    for path, raw in scored:
        value = max(0, min(100, raw))
        if shown and value >= shown[-1][1]:
            value = max(0, shown[-1][1] - 1)
        shown.append((path, value))
    return shown


def _pick_top_three(scored: list[tuple[dict, int]]) -> list[tuple[dict, int]]:
    """Best match and strong alternative are simply the two highest scores.
    The wild card is the highest remaining score from a category neither of
    the first two belongs to, so the three results never read as one career
    and two of its specialisations. With no category data (or nothing left
    outside those categories) it falls back to the next highest score.
    """
    picks = scored[:2]
    chosen_categories = {path.get("category") for path, _score in picks if path.get("category")}
    for candidate in scored[2:]:
        category = candidate[0].get("category")
        if not category or category not in chosen_categories:
            return picks + [candidate]
    return scored[:3]


def _build_recommendation(
    path: dict, score: int, tier: str, profile: dict, best: dict | None = None
) -> CareerRecommendation:
    """One recommendation, built only from what the person answered and what
    the catalogue says about the career. The service later attaches the real
    first project and first roadmap phase; nothing here invents either."""
    slug = path["slug"]
    name = path.get("name", slug)
    summary = path.get("summary", "")
    category_label = CATEGORY_LABELS.get(path.get("category") or "", "")
    rule = _TRAIT_WEIGHTS.get(slug, {"enjoys_problem_solving": 1})
    matched = matched_labels(profile, slug)

    # Only strengths the person ticked, and only where that strength points at
    # this career. Interests are not abilities, so they never appear here.
    transfers = [
        SkillTransfer(skill=label, why_it_transfers=STRENGTH_NOTES.get(tag, ""))
        for tag, label in _matched_strength_tags(profile, slug)
    ][:3]

    reasons: list[str] = []
    if matched["interests"]:
        reasons.append("you are drawn to " + _join([a.lower() for a in matched["interests"][:2]]))
    if matched["technology"]:
        reasons.append("you want to work with " + _join([a.lower() for a in matched["technology"][:2]]))
    if matched["styles"]:
        reasons.append("you would rather " + _lower_first(matched["styles"][0]))
    reasons.extend(fit_reasons(profile, slug, rule)[:2])
    preferred = profile.get("preferred_category")
    if preferred and preferred == path.get("category") and category_label:
        reasons.append(f"you pointed to {category_label} as the area closest to where you are heading")

    if reasons:
        because = "It ranks here because " + _join(reasons) + "."
    else:
        because = "Your answers did not point strongly at one area, so this ranks on your working style alone."

    lead = {
        "best_match": f"{name} is the closest match to your answers.",
        "strong_alternative": f"{name} is a strong alternative that fits many of the same answers.",
        "wild_card": f"{name} is deliberately a different angle. It comes from {category_label or 'another area'}, outside your top two, to widen what you consider.",
    }[tier]
    why = f"{lead} {because}"
    if tier == "wild_card":
        why += " It is not the strongest match on your answers, so treat it as a question worth asking."

    considerations: list[str] = []
    remote = path.get("remote_potential", 70)
    if profile.get("wants_remote") is True and remote < 50:
        considerations.append("You want to work remotely. Early roles here are often on site before remote options open up.")
    weeks = path.get("avg_timeline_weeks", 24)
    wanted_label, wanted_weeks = {
        "3_months": ("3 months", 13),
        "6_months": ("6 months", 26),
        "12_months": ("a year", 52),
    }.get(profile.get("career_timeline") or "", ("", 0))
    if wanted_weeks and weeks > wanted_weeks:
        considerations.append(
            f"The catalogue estimates about {weeks} weeks for this path at a steady pace, longer than the "
            f"{wanted_label} you hoped for. A bigger weekly commitment could close some of that gap."
        )
    if path.get("difficulty", 2) >= 4 and profile.get("current_technical_knowledge") in (None, "none"):
        considerations.append("This is one of the harder paths to start from zero. It is possible, and the early phases are paced for that.")

    best_name = (best or {}).get("name")
    differs = ""
    if best and best.get("slug") != slug and best_name:
        best_cat = CATEGORY_LABELS.get(best.get("category") or "", "")
        if category_label and category_label == best_cat:
            differs = (
                f"Both sit in {category_label}. {name}: {summary} {best_name}: {best.get('summary', '')}"
            )
        else:
            differs = (
                f"{name} is in {category_label or 'a different area'}, while {best_name} is in {best_cat or 'another'}. "
                f"{name}: {summary}"
            )

    learn = LEARNING_STYLES.get(profile.get("learning_style") or "")

    return CareerRecommendation(
        path_slug=slug,
        tier=tier,
        fit_score=score,
        why_it_fits=why,
        transferable_skills=transfers,
        skills_to_develop=(path.get("skills_required") or path.get("tools", []))[:4] or ["Fundamentals for this path"],
        difficulty_label=["Very beginner-friendly", "Beginner-friendly", "Moderate", "Challenging", "Advanced"][min(path.get("difficulty", 2) - 1, 4)],
        timeline_label=f"About {weeks} weeks at a steady pace",
        entry_roles=path.get("entry_roles", []) or ["Junior role in this field"],
        example_projects=[],
        tools=path.get("tools", []),
        earning_notes=path.get("earning_notes", "Entry-level pay varies significantly by country and remote status."),
        remote_potential_label=_remote_label(remote),
        recommended_next_step=f"Open the {name} roadmap and begin with its first phase.",
        summary=summary,
        category_label=category_label,
        matched_interests=matched["interests"],
        matched_strengths=matched["strengths"],
        matched_technology=matched["technology"],
        matched_preferences=[f"You would rather {_lower_first(label)}" for label in matched["styles"][:2]]
        + [p[0].upper() + p[1:] for p in fit_reasons(profile, slug, rule)],
        things_to_consider=considerations,
        how_it_differs=differs,
        learning_note=learn[1] if learn else "",
    )


def _matched_strength_tags(profile: dict[str, Any], slug: str) -> list[tuple[str, str]]:
    out = []
    for tag in profile.get("existing_skills") or []:
        entry = STRENGTHS.get(tag)
        if entry and entry[1].get(slug, 0) >= 3:
            out.append((tag, entry[0]))
    return out


def _lower_first(text: str) -> str:
    return text[:1].lower() + text[1:]


def _join(parts: list[str]) -> str:
    if len(parts) <= 1:
        return "".join(parts)
    return ", ".join(parts[:-1]) + " and " + parts[-1]


def _remote_label(pct: int) -> str:
    if pct >= 80:
        return "High, most entry-level roles in this field offer remote options."
    if pct >= 50:
        return "Moderate, remote roles exist but are more competitive early on."
    return "Lower early on, often starts on-site before remote options open up."


_DNA_LABELS = {
    "problem_solving": "working problems out step by step",
    "mathematics": "numbers and measurement",
    "creativity": "creative, design-led work",
    "people_orientation": "working with and for people",
    "systems_thinking": "understanding how systems fit together",
    "communication": "explaining and writing",
}
_LEGACY_FLAG = {
    "problem_solving": "enjoys_problem_solving",
    "mathematics": "enjoys_math",
    "creativity": "enjoys_creativity",
    "people_orientation": "enjoys_people",
    "systems_thinking": "prefers_systems",
    "communication": "enjoys_people",
}


def _build_career_dna(profile: dict[str, Any]) -> CareerDNA:
    """Where the person's own answers lean. Each axis is the number of answers
    that support it (see DNA_AXES), so two people who answer the same way get
    the same shape and nothing is added at random. It is a summary of
    preferences, not a measure of ability."""
    interests = set(profile.get("things_enjoyed") or [])
    strengths = set(profile.get("existing_skills") or [])
    styles = set(profile.get("problem_styles") or [])
    has_lists = bool(interests or strengths or styles or profile.get("people_preference"))

    counts: dict[str, int] = {}
    for axis, sources in DNA_AXES.items():
        n = len(interests & set(sources["interests"])) + len(strengths & set(sources["strengths"])) + len(styles & set(sources["styles"]))
        if axis == "people_orientation" and profile.get("people_preference") in ("people", "both"):
            n += 1
        if axis == "systems_thinking" and profile.get("people_preference") in ("systems", "both"):
            n += 1
        if not has_lists and profile.get(_LEGACY_FLAG[axis]):
            n += 2
        counts[axis] = n

    def pct(axis: str) -> int:
        return min(100, 15 + 25 * counts[axis])

    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], list(DNA_AXES).index(kv[0])))
    leaning = [_DNA_LABELS[a] for a, n in ranked[:2] if n > 0]
    if leaning:
        summary = (
            "Your answers lean most toward " + " and ".join(leaning) + ". "
            "This shows what you chose, not how good you are at it. It is a starting point for the careers below, not a test result."
        )
    else:
        summary = (
            "Your answers did not lean strongly in one direction, which is normal at the start. "
            "The careers below come from your working style and goals. This shows what you chose, not how good you are at anything."
        )
    return CareerDNA(
        problem_solving=pct("problem_solving"),
        mathematics=pct("mathematics"),
        creativity=pct("creativity"),
        people_orientation=pct("people_orientation"),
        systems_thinking=pct("systems_thinking"),
        communication=pct("communication"),
        summary=summary,
    )


# --------------------------------------------------------------------------
# Real provider, integration point
# --------------------------------------------------------------------------



class MentorUnavailable(Exception):
    """The live AI model could not answer. Carries a stable `code` for the
    client, whether retrying can help, and whether the cause is our
    configuration (key, model name) rather than a passing outage."""

    def __init__(self, message: str, code: str, retryable: bool = True, setup_problem: bool = False):
        super().__init__(message)
        self.code = code
        self.retryable = retryable
        self.setup_problem = setup_problem


def classify_anthropic_error(exc: Exception) -> MentorUnavailable:
    import anthropic

    if isinstance(exc, anthropic.AuthenticationError | anthropic.PermissionDeniedError):
        logger.error("AI mentor: Anthropic rejected the API key (%s). Check ANTHROPIC_API_KEY.", type(exc).__name__)
        return MentorUnavailable("The AI service is not set up correctly.", "ai_not_configured", retryable=False, setup_problem=True)
    if isinstance(exc, anthropic.NotFoundError):
        logger.error("AI mentor: model %r was not found. Check ANTHROPIC_MODEL.", settings.ANTHROPIC_MODEL)
        return MentorUnavailable("The AI model is not available.", "ai_not_configured", retryable=False, setup_problem=True)
    if isinstance(exc, anthropic.RateLimitError):
        logger.warning("AI mentor: rate limited by Anthropic")
        return MentorUnavailable("The AI service is busy.", "ai_busy")
    if isinstance(exc, anthropic.APITimeoutError):
        logger.warning("AI mentor: request to Anthropic timed out")
        return MentorUnavailable("The AI service took too long to answer.", "ai_timeout")
    if isinstance(exc, anthropic.APIConnectionError):
        logger.warning("AI mentor: could not reach Anthropic (%s)", type(exc).__name__)
        return MentorUnavailable("The AI service could not be reached.", "ai_unreachable")
    if isinstance(exc, anthropic.APIStatusError):
        logger.error("AI mentor: Anthropic returned HTTP %s", getattr(exc, "status_code", "?"))
        return MentorUnavailable("The AI service is having trouble.", "ai_unavailable")
    logger.exception("AI mentor: unexpected error calling the model")
    return MentorUnavailable("The AI service is having trouble.", "ai_unavailable")


def build_chat_messages(history: list[dict[str, Any]], user_message: str, max_turns: int = 20) -> list[dict[str, str]]:
    """Real alternating chat turns, newest message last. Consecutive turns of
    the same role are merged (the API requires alternation) and a leading
    assistant turn is dropped (it must start with the user)."""
    turns: list[dict[str, str]] = []
    for m in history[-max_turns:]:
        role = "assistant" if m.get("role") == "assistant" else "user"
        content = wrap_user_input(m["content"]) if role == "user" else m["content"]
        if turns and turns[-1]["role"] == role:
            turns[-1]["content"] += "\n\n" + content
        else:
            turns.append({"role": role, "content": content})
    while turns and turns[0]["role"] != "user":
        turns.pop(0)
    new = wrap_user_input(user_message)
    if turns and turns[-1]["role"] == "user":
        turns[-1]["content"] += "\n\n" + new
    else:
        turns.append({"role": "user", "content": new})
    return turns


def build_mentor_context_block(ctx: dict[str, Any]) -> str:
    """The learner's real CareerFound facts, for the model. Only facts that
    exist are listed; the model is told not to assume anything else."""
    lines = ["Learner context from their CareerFound account (these are the only facts you have about them):"]
    lines.append(f"- First name: {(ctx.get('full_name') or 'unknown').split(' ')[0]}")
    lines.append(f"- Experience level: {ctx.get('experience', 'beginner')}")
    for label, key in (("Situation", "persona"), ("Goal", "goal")):
        if ctx.get(key):
            lines.append(f"- {label}: {ctx[key]}")
    if ctx.get("path_name"):
        lines.append(f"- Active career path: {ctx['path_name']}" + (f" ({ctx['path_summary']})" if ctx.get("path_summary") else ""))
        if ctx.get("lessons_total"):
            lines.append(f"- Lessons completed: {ctx.get('lessons_done', 0)} of {ctx['lessons_total']}")
        if ctx.get("current_phase"):
            lines.append(f"- Current roadmap phase: {ctx['current_phase']}")
        proj = ctx.get("current_project")
        if proj:
            lines.append(f"- Active project: {proj['title']} (teaches: {proj.get('teaches', '')})")
        if ctx.get("next_tasks"):
            lines.append("- Next unfinished items: " + "; ".join(ctx["next_tasks"][:3]))
    else:
        lines.append("- No active roadmap yet (they have not chosen a path).")
    if ctx.get("declared_skills"):
        lines.append("- Skills they listed themselves: " + ", ".join(ctx["declared_skills"][:10]))
    if ctx.get("certifications"):
        lines.append("- Certifications they listed: " + ", ".join(ctx["certifications"][:5]))
    if ctx.get("recent_activity"):
        lines.append("- Recent completed activity: " + "; ".join(ctx["recent_activity"][:3]))
    lines.append(
        "Use this only when it helps answer the question. If something is not listed here, you do not know it: "
        "do not invent progress, projects, skills, certifications or personal details."
    )
    return "\n".join(lines)


def split_follow_ups(text: str) -> tuple[str, list[str]]:
    """The model may end with a line `FOLLOW_UPS: question | question`. Split it
    off so the reply text stays clean. Absent or malformed means no chips."""
    lines = text.rstrip().splitlines()
    if lines and lines[-1].strip().upper().startswith("FOLLOW_UPS:"):
        raw = lines[-1].split(":", 1)[1]
        follow_ups = [q.strip(" -*\"") for q in raw.split("|") if q.strip(" -*\"")]
        return "\n".join(lines[:-1]).rstrip(), [q for q in follow_ups if len(q) <= 120][:3]
    return text.strip(), []


class AnthropicProvider(LLMClient):
    """Live provider using the Anthropic Messages API with structured
    (JSON-schema constrained) outputs. This class is fully wired, the only
    thing standing between this and a live AI mentor is an API key in
    ANTHROPIC_API_KEY. See README.md 'Going live with real AI' section.
    """

    def __init__(self) -> None:
        import anthropic  # imported lazily so `mock` mode has zero dependency risk

        self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY, timeout=45.0, max_retries=1)
        self._model = settings.ANTHROPIC_MODEL

    async def _structured_call(self, system: str, user_content: str, schema_model: type) -> Any:
        schema = schema_model.model_json_schema()
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=2000,
            system=system + "\n\nRespond ONLY with valid JSON matching this schema:\n" + json.dumps(schema),
            messages=[{"role": "user", "content": user_content}],
        )
        text = response.content[0].text
        return schema_model.model_validate_json(text)

    async def analyze_assessment(self, profile, career_catalog) -> AssessmentResult:
        user_content = (
            f"Profile:\n{wrap_user_input(json.dumps(profile, default=str))}\n\n"
            f"Career catalog (choose 3 from this list only):\n{json.dumps(career_catalog)}"
        )
        return await self._structured_call(ASSESSMENT_SYSTEM_PROMPT, user_content, AssessmentResult)

    async def mentor_reply(self, history, user_message, user_context) -> MentorReply:
        """One real chat turn: the system prompt carries the learner's real
        CareerFound context, the conversation goes in as proper alternating
        turns, and any failure is raised as MentorUnavailable so the app can
        show an honest error and a retry instead of a stand-in answer."""
        system = MENTOR_SYSTEM_PROMPT + "\n\n" + build_mentor_context_block(user_context)
        messages = build_chat_messages(history, user_message)
        try:
            response = await self._client.messages.create(
                model=self._model,
                max_tokens=1200,
                system=system,
                messages=messages,
            )
        except Exception as exc:  # classified below, never swallowed
            raise classify_anthropic_error(exc) from exc
        text = "".join(getattr(b, "text", "") for b in response.content if getattr(b, "type", "") == "text").strip()
        if not text:
            logger.error("AI mentor: model returned an empty reply (stop_reason=%s)", getattr(response, "stop_reason", None))
            raise MentorUnavailable("The AI Mentor returned an empty answer.", "ai_empty_reply", retryable=True)
        message, follow_ups = split_follow_ups(text)
        return MentorReply(message=message, follow_up_questions=follow_ups, mode="live")

    async def review_project(self, project_title, project_context, submission_text) -> ProjectReview:
        user_content = (
            f"Project: {project_title}\nContext: {json.dumps(project_context, default=str)}\n\n"
            f"Submission:\n{wrap_user_input(submission_text)}"
        )
        return await self._structured_call(PROJECT_REVIEW_SYSTEM_PROMPT, user_content, ProjectReview)

    async def generate_portfolio_copy(self, project_title, project_context, submission_text) -> PortfolioCopy:
        user_content = (
            f"Project: {project_title}\nContext: {json.dumps(project_context, default=str)}\n\n"
            f"Submission:\n{wrap_user_input(submission_text)}"
        )
        return await self._structured_call(PORTFOLIO_SYSTEM_PROMPT, user_content, PortfolioCopy)
