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
from app.core.config import settings


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
# Mock provider — realistic, input-driven, zero external dependency
# --------------------------------------------------------------------------

_BEGINNER_EXPLAINERS = {
    "software-engineering": "building the applications and systems people use every day",
    "frontend-development": "building the part of a website or app people see and click on",
    "backend-engineering": "building the behind-the-scenes systems that power an app",
    "full-stack-development": "building both what people see and what powers it behind the scenes",
    "cloud-engineering": "setting up and running computer systems that live on the internet ('the cloud') instead of one physical machine",
    "cloud-security": "protecting those internet-based systems from attackers",
    "cybersecurity": "protecting computers, networks, and data from people trying to break in",
    "soc-analysis": "watching over a company's systems in real time and catching attacks as they happen",
    "penetration-testing": "legally breaking into systems on purpose to find weaknesses before criminals do",
    "devops": "making sure software gets built, tested, and delivered smoothly and reliably",
    "data-analysis": "turning raw numbers into insights that help people make decisions",
    "data-engineering": "building the pipelines that move and organize data so others can use it",
    "ai-ml-engineering": "building systems that learn patterns from data to make predictions",
    "product-design": "shaping how a product looks, feels, and solves a user's problem",
    "ui-ux-design": "designing interfaces that are easy and pleasant for people to use",
    "product-management": "deciding what a product should do next and why",
    "technical-writing": "explaining complex technical things in a way anyone can understand",
    "qa-engineering": "testing software methodically to catch bugs before users do",
    "no-code-automation": "building working software tools without writing much or any code",
    "it-support": "helping people solve everyday computer and technology problems",
    "solutions-architecture": "designing the overall blueprint for how a company's systems fit together",
}


class MockLLMProvider(LLMClient):
    async def analyze_assessment(
        self, profile: dict[str, Any], career_catalog: list[dict[str, Any]]
    ) -> AssessmentResult:
        scored = _score_paths(profile, career_catalog)
        top3 = scored[:3]
        tiers = ["best_match", "strong_alternative", "wild_card"]

        recommendations: list[CareerRecommendation] = []
        for (path, score), tier in zip(top3, tiers, strict=False):
            recommendations.append(_build_recommendation(path, score, tier, profile))

        dna = _build_career_dna(profile)
        return AssessmentResult(career_dna=dna, recommendations=recommendations)

    async def mentor_reply(
        self,
        history: list[dict[str, str]],
        user_message: str,
        user_context: dict[str, Any],
    ) -> MentorReply:
        wrap_user_input(user_message)  # injection heuristic runs for logging/telemetry
        msg_lower = user_message.lower()
        beginner = user_context.get("beginner_mode", True)
        name = user_context.get("full_name", "there").split(" ")[0]

        struggle_markers = ["i don't understand", "i dont understand", "confused", "stuck", "don't get it"]
        is_struggling = any(m in msg_lower for m in struggle_markers)

        topic = _extract_topic(user_message)

        if is_struggling:
            analogy = _ANALOGIES.get(topic, _ANALOGIES["default"])
            message = (
                f"That's okay, {name} — this trips up almost everyone at first. "
                f"Let's set the technical definition aside for a second. {analogy} "
                f"Once that clicks, the formal version will feel obvious. "
                f"Want me to connect that back to {topic or 'the actual concept'} now, "
                f"or give you a tiny exercise to test it first?"
            )
            struggle = topic or "general concept"
            adjustment = f"Consider inserting a short refresher lesson on '{topic}' before the next phase unlocks."
        elif "?" in user_message:
            depth = "in plain language, minimal jargon" if beginner else "with technical precision"
            message = (
                f"Good question. Here's the short answer {depth}: "
                f"{_short_answer(topic)} "
                f"Try applying that in your current project — if it doesn't click, paste what "
                f"you tried and I'll help you debug it rather than just giving you the fix."
            )
            struggle = None
            adjustment = None
        else:
            message = (
                f"Got it. Based on where you are in your roadmap, here's how I'd think about that: "
                f"{_short_answer(topic)} What have you tried so far?"
            )
            struggle = None
            adjustment = None

        follow_ups = _follow_up_questions(topic)
        return MentorReply(
            message=message,
            detected_struggle=struggle,
            suggested_roadmap_adjustment=adjustment,
            follow_up_questions=follow_ups,
        )

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
                        "This submission is quite short for a full project review — I can only "
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
                        f"Good structure overall for '{project_title}' — it's clear you followed "
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
                            "is missing or a network call fails? Add a guard for that — it's exactly "
                            "the kind of thing interviewers probe on."
                        ),
                    )
                )
            if "test" not in submission_text.lower():
                findings.append(
                    ProjectReviewFinding(
                        severity="nice_to_have",
                        comment="Consider adding one or two simple tests — even manual test notes in your README count and strengthen your portfolio write-up.",
                    )
                )
            findings.append(
                ProjectReviewFinding(
                    severity="should_fix",
                    comment="Add inline comments explaining *why*, not *what* — reviewers skim for reasoning, not restated code.",
                )
            )

        skills = project_context.get("skills_demonstrated") or [project_context.get("skill_hint", "problem solving")]
        overall = (
            f"Solid attempt at '{project_title}'. You're demonstrating real progress on "
            f"{', '.join(skills[:2]) if skills else 'the core concept'} — a few targeted fixes "
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
            + "\n\n## How to run it\n_Add your setup/run instructions here._\n\n## What I'd improve next\n_Add 1-2 honest next steps — reviewers value this._\n"
        )
        cv_bullet = (
            f"{_cv_verb(project_title)} {project_title.lower()}, applying {skills[0] if skills else 'core technical skills'} "
            f"to {teaches}."
        )
        linkedin = (
            f"🚀 Just finished building {project_title}! This project let me apply {skills_str} to a real "
            f"scenario — {teaches}. Small step, but exactly the kind of hands-on work I want to keep doing. "
            f"#buildinpublic #tech"
        )
        case_study = (
            f"## {project_title} — Case Study\n\n**Problem:** {teaches}.\n\n**Approach:** "
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


_ANALOGIES = {
    "dns": (
        "Imagine you want to visit a friend's house but you only know their name, not their "
        "address. DNS is the phonebook of the internet — it takes a name you understand, like "
        "google.com, and looks up the actual numeric address computers use to find each other."
    ),
    "ip address": (
        "Think of an IP address like a street address for a computer — it's how data knows "
        "exactly where to be delivered on a network with millions of other computers."
    ),
    "tcp/ip": (
        "Think of TCP/IP like the postal service's rules: IP is the address on the envelope, and "
        "TCP is the promise that every page of your letter arrives, in order, and nothing's missing."
    ),
    "api": (
        "An API is like a restaurant menu: you don't need to know how the kitchen works, you just "
        "order from the menu (the API) and the kitchen (the server) hands back what you asked for."
    ),
    "default": (
        "Let's strip away the jargon and start from what you already know, then build up to the "
        "technical term one small piece at a time."
    ),
}


def _extract_topic(text: str) -> str:
    text_lower = text.lower()
    for key in _ANALOGIES:
        if key != "default" and key in text_lower:
            return key
    return ""


def _short_answer(topic: str) -> str:
    answers = {
        "dns": "DNS translates human-friendly names into the numeric addresses computers use.",
        "ip address": "Every device on a network gets a unique address so data knows where to go.",
        "tcp/ip": "TCP/IP is the pair of rules that address and reliably deliver data across networks.",
        "api": "An API is a defined way for two pieces of software to talk to each other.",
    }
    return answers.get(topic, "Let's break that down together, starting from first principles.")


def _follow_up_questions(topic: str) -> list[str]:
    if topic:
        return [f"Want a 2-minute exercise on {topic}?", "Should I quiz you on this before moving on?"]
    return ["Want me to suggest what to learn next?", "Should we do a quick practice question on this?"]


def _score_paths(profile: dict[str, Any], career_catalog: list[dict[str, Any]]) -> list[tuple[dict, int]]:
    """Deterministic heuristic scorer over the profile vector. Mirrors the
    declarative `path_fit_rules` table in spirit — this mock keeps the logic
    inline so the assessment is demoable without seed data being present.
    """
    weights = {
        "cybersecurity": {"enjoys_problem_solving": 3, "prefers_systems": 3, "enjoys_math": 1},
        "soc-analysis": {"enjoys_problem_solving": 2, "prefers_systems": 2, "enjoys_people": 1},
        "penetration-testing": {"enjoys_problem_solving": 3, "prefers_systems": 2, "risk_tolerant": 2},
        "cloud-security": {"prefers_systems": 3, "enjoys_problem_solving": 2},
        "software-engineering": {"enjoys_problem_solving": 3, "enjoys_math": 2, "prefers_systems": 2},
        "backend-engineering": {"enjoys_problem_solving": 3, "prefers_systems": 3},
        "frontend-development": {"enjoys_creativity": 3, "enjoys_problem_solving": 2},
        "full-stack-development": {"enjoys_problem_solving": 2, "enjoys_creativity": 2, "prefers_systems": 2},
        "devops": {"prefers_systems": 3, "enjoys_problem_solving": 2},
        "cloud-engineering": {"prefers_systems": 3, "enjoys_math": 1},
        "data-analysis": {"enjoys_math": 3, "enjoys_problem_solving": 2},
        "data-engineering": {"enjoys_math": 2, "prefers_systems": 3},
        "ai-ml-engineering": {"enjoys_math": 3, "enjoys_problem_solving": 3},
        "product-design": {"enjoys_creativity": 3, "enjoys_people": 2},
        "ui-ux-design": {"enjoys_creativity": 3, "enjoys_people": 2},
        "product-management": {"enjoys_people": 3, "enjoys_problem_solving": 1},
        "technical-writing": {"enjoys_people": 2, "enjoys_creativity": 1},
        "qa-engineering": {"enjoys_problem_solving": 2, "prefers_systems": 1},
        "no-code-automation": {"enjoys_problem_solving": 1, "enjoys_creativity": 1},
        "it-support": {"enjoys_people": 3, "prefers_systems": 1},
        "solutions-architecture": {"prefers_systems": 3, "enjoys_problem_solving": 2},
    }

    scored = []
    for path in career_catalog:
        slug = path["slug"]
        rule = weights.get(slug, {"enjoys_problem_solving": 1})
        score = 50
        for trait, weight in rule.items():
            if profile.get(trait):
                score += weight * 8
        # light variety so repeated identical answers don't always rank identically
        score += random.Random(slug + json.dumps(profile, sort_keys=True, default=str)).randint(-3, 3)
        scored.append((path, max(0, min(100, score))))

    scored.sort(key=lambda t: t[1], reverse=True)
    return scored


def _build_recommendation(path: dict, score: int, tier: str, profile: dict) -> CareerRecommendation:
    slug = path["slug"]
    beginner_desc = _BEGINNER_EXPLAINERS.get(slug, path.get("summary", ""))

    transfers = []
    if profile.get("enjoys_problem_solving"):
        transfers.append(SkillTransfer(skill="Problem solving", why_it_transfers="Core to debugging and root-cause analysis in this field."))
    if profile.get("enjoys_math"):
        transfers.append(SkillTransfer(skill="Comfort with logic/math", why_it_transfers="Helps with the structured, rule-based thinking this path uses daily."))
    if profile.get("enjoys_people"):
        transfers.append(SkillTransfer(skill="Communication", why_it_transfers="Useful for explaining findings and working cross-functionally."))
    if not transfers:
        transfers.append(SkillTransfer(skill="Curiosity", why_it_transfers="The single best predictor of success for a total beginner in this field."))

    why = {
        "best_match": f"This is your strongest match: {beginner_desc}, and your answers line up closely with how people who thrive here describe themselves.",
        "strong_alternative": f"A strong runner-up: {beginner_desc}. If your priorities shift (budget, time, or interests), this is a great backup direction.",
        "wild_card": f"A less obvious pick worth exploring: {beginner_desc}. It's not the most predictable fit from your answers, but people with your mix of interests sometimes end up loving it.",
    }[tier]

    return CareerRecommendation(
        path_slug=slug,
        tier=tier,
        fit_score=score,
        why_it_fits=why,
        transferable_skills=transfers,
        skills_to_develop=path.get("tools", [])[:4] or ["Fundamentals for this path"],
        difficulty_label=["Very beginner-friendly", "Beginner-friendly", "Moderate", "Challenging", "Advanced"][min(path.get("difficulty", 2) - 1, 4)],
        timeline_label=f"~{path.get('avg_timeline_weeks', 24)} weeks at a steady pace",
        entry_roles=path.get("entry_roles", []) or ["Junior role in this field"],
        example_projects=[f"Beginner project in {path.get('name', slug)}", "A guided mini-project", "A capstone project for your portfolio"],
        tools=path.get("tools", []),
        earning_notes=path.get("earning_notes", "Entry-level pay varies significantly by country and remote status."),
        remote_potential_label=_remote_label(path.get("remote_potential", 70)),
        recommended_next_step=f"Start Phase 1 of the {path.get('name', slug)} roadmap today — no prior experience required.",
    )


def _remote_label(pct: int) -> str:
    if pct >= 80:
        return "High — most entry-level roles in this field offer remote options."
    if pct >= 50:
        return "Moderate — remote roles exist but are more competitive early on."
    return "Lower early on — often starts on-site before remote options open up."


def _build_career_dna(profile: dict[str, Any]) -> CareerDNA:
    def pct(flag_key: str, base: int = 40) -> int:
        return min(100, base + (35 if profile.get(flag_key) else 0) + random.Random(flag_key).randint(0, 10))

    return CareerDNA(
        problem_solving=pct("enjoys_problem_solving", 45),
        mathematics=pct("enjoys_math", 35),
        creativity=pct("enjoys_creativity", 40),
        people_orientation=pct("enjoys_people", 35),
        systems_thinking=pct("prefers_systems", 40),
        communication=pct("enjoys_people", 45),
        summary=(
            "Your answers show a profile that leans toward "
            + _dominant_trait(profile)
            + " — that's a strong signal for the paths recommended below."
        ),
    )


def _dominant_trait(profile: dict[str, Any]) -> str:
    labels = {
        "enjoys_problem_solving": "structured problem solving",
        "enjoys_math": "analytical, math-driven thinking",
        "enjoys_creativity": "creative, design-oriented thinking",
        "enjoys_people": "people-facing, communication-driven work",
        "prefers_systems": "systems-oriented thinking",
    }
    for key, label in labels.items():
        if profile.get(key):
            return label
    return "broad, exploratory curiosity"


# --------------------------------------------------------------------------
# Real provider — integration point
# --------------------------------------------------------------------------


class AnthropicProvider(LLMClient):
    """Live provider using the Anthropic Messages API with structured
    (JSON-schema constrained) outputs. This class is fully wired — the only
    thing standing between this and a live AI mentor is an API key in
    ANTHROPIC_API_KEY. See README.md 'Going live with real AI' section.
    """

    def __init__(self) -> None:
        import anthropic  # imported lazily so `mock` mode has zero dependency risk

        self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
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
        transcript = "\n".join(f"{m['role']}: {m['content']}" for m in history[-10:])
        user_content = (
            f"Conversation so far:\n{transcript}\n\n"
            f"Learner context: {json.dumps(user_context, default=str)}\n\n"
            f"New message:\n{wrap_user_input(user_message)}"
        )
        return await self._structured_call(MENTOR_SYSTEM_PROMPT, user_content, MentorReply)

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
