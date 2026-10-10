"""The AI Mentor's limited mode: used only when no live AI model is switched on.

It is a rules and knowledge responder, not a language model, and the product
says so. What makes it useful instead of repetitive:

- It works out what kind of message this is (a concept question, a pasted
  error, interview practice, a career comparison, a "what next" question, a
  project question, a follow up to its own last answer) and answers that.
- It uses facts about the learner that come from the database (path, phase,
  active project, next tasks, declared skills). If a fact is absent it says
  nothing about it. It never invents progress, projects or credentials.
- When it has no prepared guidance for a topic it says so and asks a precise
  question, rather than printing a generic filler sentence.
"""
from __future__ import annotations

import re
from typing import Any

from app.ai.mentor_knowledge import ERRORS, TOPICS, ErrorPattern, Topic
from app.ai.schemas import MentorReply

_EXPLAIN = re.compile(
    r"^\s*(what('?s| is| are| does)|explain|how (does|do|is)|why (does|do|is)|difference between|"
    r"can you explain|tell me about|walk me through|what do you mean)\b"
)
_STRUGGLE = re.compile(r"i don'?t (understand|get)|confus|\bstuck\b|lost|makes no sense|too hard|overwhelm")
_ERRORISH = re.compile(
    r"\b(error|exception|traceback|crash(es|ed|ing)?|not working|doesn'?t work|won'?t (run|start|work|load)|"
    r"fail(s|ed|ing)?|broken|bug|refused|denied|rejected|can'?t (connect|run|install|log ?in)|returns? (a )?\d{3})\b"
)
_INTERVIEW = re.compile(r"interview|mock|tell me about yourself|behaviou?ral|star method|whiteboard|technical round|screening call|hiring manager")
_ROADMAP = re.compile(
    r"what (should|do) i (learn|study|do|focus|work on)|learn next|what('?s| is) next|next step|roadmap|study plan|"
    r"where (do|should) i (start|begin)|how (long|many (weeks|months|hours))|how do i (start|begin|get started)|learning (path|order)|in what order|prioriti[sz]e|"
    r"not sure what to"
)
_PROJECT = re.compile(r"\bprojects?\b|portfolio|side project|capstone|lab\b")
_PROJECT_IDEAS = re.compile(r"idea|what (should|can) i build|suggest|which project")
_CV = re.compile(r"\bcv\b|resume|résumé|linkedin|github profile|readme|cover letter|job search|apply(ing)? (for|to)|job application|recruiter")
_CAREER_WORDS = re.compile(
    r"which career|what career|career (path|change|switch|choice)|should i (become|choose|pick|go into|switch|study)|"
    r"too (old|late)|switch(ing)? (careers?|into|to)|change careers?|career in tech|break into|what (job|role)s?\b|salary|how much (do|does|can)|"
    r"\bvs\.?\b|\bversus\b|or should i|better (career|path|choice)"
)
_GREETING = re.compile(r"^\s*(hi|hello|hey|yo|hiya|good (morning|afternoon|evening)|help|help me|start|test|ping)\W*$")

_FOLLOW = {
    "example": re.compile(r"\b(example|show me|demo|sample|code for it)\b"),
    "simpler": re.compile(r"\b(simpl|eli5|plain english|in other words|explain (it |that )?again|dumb it down|still (don'?t|do not) (get|understand))"),
    "deeper": re.compile(r"\b(deeper|more detail|go deeper|in depth|advanced|technical (version|detail))"),
    "quiz": re.compile(r"\b(quiz|test me|practice question|check my understanding|exercise)\b"),
    "why": re.compile(r"^\s*(why|but why|and why)\b|why does that|why is that"),
}

_TOPIC_BY_KEY = {t.key: t for t in TOPICS}


# --------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------


def compose_limited_reply(history: list[dict[str, Any]], message: str, ctx: dict[str, Any]) -> MentorReply:
    text = (message or "").strip()
    low = text.lower()
    beginner = ctx.get("experience", "beginner") == "beginner"
    first = (ctx.get("full_name") or "there").split(" ")[0]

    prior = _last_assistant_meta(history)
    prior_topic = _TOPIC_BY_KEY.get(prior.get("topic") or "")
    topic = _find_topic(low)
    words = len(low.split())

    if not text or _GREETING.match(low):
        return _greeting(first, ctx)

    # A short follow up to the last answer ("an example?", "simpler please", "why?")
    if prior_topic and topic is None and words <= 14:
        for kind, rx in _FOLLOW.items():
            if rx.search(low):
                return _followup(kind, prior_topic, beginner, ctx)

    # Feedback on the learner's own answer to a mock interview question
    if prior.get("intent") == "interview_question" and words >= 18 and "?" not in text[-3:]:
        return _interview_feedback(text, prior, ctx)

    # "How do I write a README for my GitHub project" is about a CV or portfolio task, not a Git lesson.
    explain_question = bool(_EXPLAIN.search(low))
    explain = explain_question and not _CV.search(low)
    error = _match_error(low)

    if explain and topic and not _ERRORISH.search(low):
        return _concept(topic, low, beginner, ctx, first)
    if error is not None or (_ERRORISH.search(low) and not explain_question):
        return _troubleshoot(error, topic, text, ctx)
    if _INTERVIEW.search(low):
        return _interview(low, topic, history, ctx)

    careers = _careers_mentioned(low, ctx)
    wants_roadmap = bool(_ROADMAP.search(low))
    # "How long to become a cloud engineer?" is about that career, unless it is the learner's own path.
    timing_only = bool(re.search(r"how (long|many (weeks|months|hours))", low)) and not re.search(
        r"what (should|do) i|next|roadmap|study plan|where (do|should)", low
    )
    named_career = (
        bool(careers)
        and (len(careers) >= 2 or not wants_roadmap or (timing_only and careers[0]["slug"] != ctx.get("path_slug")))
        and not _PROJECT.search(low)
    )
    general_career = bool(_CAREER_WORDS.search(low)) and not wants_roadmap and topic is None
    if named_career or general_career:
        return _career(low, careers, ctx, first)
    if wants_roadmap:
        return _roadmap(low, ctx, first)
    if _CV.search(low):
        return _cv(low, ctx)
    if _PROJECT.search(low):
        return _project(low, topic, ctx, first)
    if topic:
        return _concept(topic, low, beginner, ctx, first)
    return _unclear(text, ctx, first)


# --------------------------------------------------------------------------
# Detection helpers
# --------------------------------------------------------------------------


def _find_topic(low: str) -> Topic | None:
    best: Topic | None = None
    best_pos = 10**9
    for t in TOPICS:
        m = re.search(t.pattern, low)
        if m and m.start() < best_pos:
            best, best_pos = t, m.start()
    return best


def _match_error(low: str) -> ErrorPattern | None:
    for e in ERRORS:
        if re.search(e.pattern, low):
            return e
    return None


def _last_assistant_meta(history: list[dict[str, Any]]) -> dict[str, Any]:
    for m in reversed(history):
        if m.get("role") == "assistant":
            return m.get("meta") or {}
    return {}


_ROLE_PREFIX = re.compile(r"^(junior|associate|entry level|entry-level|trainee|graduate|senior|lead)\s+")
_SINGULAR = (("engineering", "engineer"), ("development", "developer"), ("design", "designer"), ("analysis", "analyst"),
             ("administration", "administrator"), ("management", "manager"), ("science", "scientist"), ("writing", "writer"),
             ("research", "researcher"), ("consulting", "consultant"), ("architecture", "architect"))


def _career_aliases(c: dict[str, Any]) -> dict[str, bool]:
    """Ways a person might name this career, mapped to whether the alias is
    primary (its own name, slug or job-title form, always identifies it) or
    secondary (an entry role title, which several careers can share). Short
    aliases are dropped so a common word can't match."""
    name = c["name"].lower()
    aliases = {name: True, c["slug"].replace("-", " "): True}
    for plural, single in _SINGULAR:
        if plural in name:
            aliases[name.replace(plural, single)] = True
    for role in c.get("entry_roles", []):
        aliases.setdefault(_ROLE_PREFIX.sub("", role.lower().strip()), False)
    return {a: primary for a, primary in aliases.items() if len(a) >= 8}


def _careers_mentioned(low: str, ctx: dict[str, Any]) -> list[dict[str, Any]]:
    found: list[tuple[int, dict[str, Any]]] = []
    catalogue = ctx.get("career_catalogue", [])
    # A job title shared by several careers ("software engineer") doesn't identify one of them.
    owners: dict[str, int] = {}
    for c in catalogue:
        for a in _career_aliases(c):
            owners[a] = owners.get(a, 0) + 1
    for c in catalogue:
        positions = [low.find(a) for a, primary in _career_aliases(c).items() if primary or owners[a] == 1]
        positions = [p for p in positions if p >= 0]
        if positions:
            found.append((min(positions), c))
    found.sort(key=lambda x: x[0])
    out = [c for _, c in found]
    # Keep the most specific match: drop "Cloud" careers whose name sits inside a longer matched name.
    return [c for c in out if not any(c is not o and c["name"].lower() in o["name"].lower() for o in out)]


def _bullets(items: list[str] | tuple[str, ...]) -> str:
    return "\n".join(f"- {i}" for i in items)


def _facts(ctx: dict[str, Any]) -> str:
    """One sentence of real context, or an empty string."""
    bits = []
    if ctx.get("path_name"):
        bits.append(f"you are on the {ctx['path_name']} path")
    if ctx.get("current_phase"):
        bits.append(f"your current focus is \"{ctx['current_phase']}\"")
    if ctx.get("current_project"):
        bits.append(f"the project in front of you is \"{ctx['current_project']['title']}\"")
    if not bits:
        return ""
    return "From your CareerFound account: " + ", and ".join(bits) + "."


def _reply(message: str, *, topic: str | None = None, intent: str, follow_ups: list[str] | None = None,
           struggle: str | None = None, adjustment: str | None = None) -> MentorReply:
    return MentorReply(
        message=message,
        detected_struggle=struggle,
        suggested_roadmap_adjustment=adjustment,
        follow_up_questions=(follow_ups or [])[:3],
        topic=topic,
        intent=intent,
        mode="limited",
    )


# --------------------------------------------------------------------------
# Intents
# --------------------------------------------------------------------------


def _greeting(first: str, ctx: dict[str, Any]) -> MentorReply:
    parts = [f"Hi {first}. Tell me what you are working on or stuck on, and I will answer that specifically."]
    nxt = (ctx.get("next_tasks") or [])[:1]
    if nxt:
        parts.append(f"Your next unfinished item on CareerFound is: {nxt[0]}. I can help you with it if you like.")
    else:
        parts.append("You can ask me to explain a concept, look at an error message, practise an interview question, or compare careers.")
    return _reply("\n\n".join(parts), intent="greeting",
                  follow_ups=["Explain a concept I am stuck on", "Give me an interview question", "What should I learn next?"])


def _concept(topic: Topic, low: str, beginner: bool, ctx: dict[str, Any], first: str) -> MentorReply:
    struggling = bool(_STRUGGLE.search(low))
    parts: list[str] = []
    if struggling:
        parts.append(f"That is fine, {first}. {topic.title} trips up a lot of people at first, so let's start from the picture and then add the detail.")
        parts.append(topic.analogy)
        parts.append("Here is the same idea with the proper terms:\n" + topic.technical)
    elif beginner:
        parts.append(topic.analogy)
        parts.append("In more precise terms: " + topic.technical)
    else:
        parts.append(topic.technical)
    parts.append("A concrete example:\n" + topic.example)
    parts.append("A mistake to avoid: " + topic.mistake)
    parts.append("Try this next: " + topic.practice)
    tie = ""
    proj = ctx.get("current_project")
    if proj and (topic.key in proj["title"].lower() or topic.title.split()[0].lower() in proj["title"].lower()):
        tie = f"This connects directly to your current project, \"{proj['title']}\"."
        parts.insert(1 if not struggling else 2, tie)
    return _reply("\n\n".join(parts), topic=topic.key, intent="concept", follow_ups=list(topic.follow_ups),
                  struggle=topic.title if struggling else None,
                  adjustment=f"Consider a short refresher on {topic.title} before the next phase." if struggling else None)


def _followup(kind: str, topic: Topic, beginner: bool, ctx: dict[str, Any]) -> MentorReply:
    if kind == "example":
        msg = f"Here is a concrete example for {topic.title}:\n\n{topic.example}\n\nWhat do you expect to see when you run it? Say it first, then check."
    elif kind == "simpler":
        msg = f"Let me say it more simply. {topic.analogy}\n\nIf that makes sense, the only extra step is the proper name for each part. Which part is still fuzzy?"
    elif kind == "deeper":
        msg = f"The precise version of {topic.title}:\n\n{topic.technical}\n\nThe mistake people make: {topic.mistake}"
    elif kind == "quiz":
        msg = f"Quick check on {topic.title}. Answer in your own words:\n\n{topic.interview_q}\n\nWhen you reply, I will point out what is missing from your answer."
    else:  # why
        msg = f"The reason {topic.title} works this way: {topic.technical}\n\nThe mistake it prevents or causes: {topic.mistake}"
    return _reply(msg, topic=topic.key, intent="followup", follow_ups=list(topic.follow_ups))


def _troubleshoot(err: ErrorPattern | None, topic: Topic | None, text: str, ctx: dict[str, Any]) -> MentorReply:
    ask = (
        "To pin it down, send me:\n"
        "- the exact error text (copy and paste, not a description)\n"
        "- the command or action that triggered it\n"
        "- your operating system and the language or tool versions\n"
        "- what you already tried"
    )
    if err is None:
        lead = "I can help you work this out, but \"not working\" could be many things, so I want to avoid guessing."
        extra = ""
        if topic:
            extra = f"\n\nSince you mentioned {topic.title}: {topic.mistake}"
        return _reply(f"{lead}\n\n{ask}{extra}", topic=topic.key if topic else None, intent="clarify_error",
                      follow_ups=["Paste the full error text", "What command did you run?"])
    msg = (
        f"That error means: {err.meaning}\n\n"
        f"Most likely causes:\n{_bullets(err.causes)}\n\n"
        f"What to check, in order:\n{_bullets(err.checks)}\n\n"
        "If it is still failing after that, send me the full error text, the command you ran, and what you already changed, and we will narrow it down together."
    )
    return _reply(msg, intent="troubleshoot", follow_ups=["Here is the full error text", "I tried that and it still fails"])


def _interview(low: str, topic: Topic | None, history: list[dict[str, Any]], ctx: dict[str, Any]) -> MentorReply:
    if re.search(r"tell me about yourself|introduce yourself|walk me through your (cv|resume|background)", low):
        path = ctx.get("path_name")
        direction = f"into {path}" if path else "into tech"
        msg = (
            "A strong answer to \"tell me about yourself\" is about 60 to 90 seconds, in three parts:\n\n"
            "- Present: what you do or are learning now, and one concrete thing you have built or done.\n"
            f"- Past: the one or two experiences that led you {direction}. Keep it relevant, not a full life story.\n"
            "- Future: why this role and this company, and what you want to contribute.\n\n"
            "Write it with your own real details, then say it aloud twice. If you paste your draft here, I will tell you which part is vague or missing."
        )
        return _reply(msg, intent="interview_tips", follow_ups=["Here is my draft", "How do I answer a weakness question?"])
    if re.search(r"star method|behaviou?ral|conflict|weakness|strength|failure|teamwork", low):
        msg = (
            "For behavioural questions use STAR:\n\n"
            "- Situation: one sentence of context.\n"
            "- Task: what you were responsible for.\n"
            "- Action: what you did, using \"I\", step by step. This is the longest part.\n"
            "- Result: what changed, with a number or a concrete outcome, and what you learned.\n\n"
            "Prepare three real stories (a challenge, a mistake, a disagreement) and reuse them for different questions. Say one story to me and I will point out where the action or the result is thin."
        )
        return _reply(msg, intent="interview_tips", follow_ups=["Here is one of my stories", "Give me a technical question instead"])
    pool: list[str] = []
    if topic:
        pool.append(topic.interview_q)
    pool += list(ctx.get("interview_prep") or [])
    if not pool:
        pool = ["Tell me about a time you got stuck on a problem and how you worked out what to do next.",
                "Describe a project you built or a course project you are proud of. What tradeoff did you make?"]
    question = pool[len(history) % len(pool)]
    where = f" for the {ctx['path_name']} path" if ctx.get("path_name") and not topic else ""
    msg = (
        f"Here is a practice question{where}:\n\n\"{question}\"\n\n"
        "Answer it as if the interviewer were in front of you. Aim for 60 to 120 seconds spoken: say your approach first, then the details, then one thing you would do differently. "
        "Type your answer and I will tell you what is clear and what is missing."
    )
    return _reply(msg, topic=topic.key if topic else None, intent="interview_question",
                  follow_ups=["Give me a harder one", "Give me a behavioural question"])


def _interview_feedback(answer: str, prior: dict[str, Any], ctx: dict[str, Any]) -> MentorReply:
    low = answer.lower()
    words = len(answer.split())
    notes_good: list[str] = []
    notes_fix: list[str] = []
    if re.search(r"\bfirst\b|\bthen\b|\bnext\b|\bfinally\b|\bstep\b", low):
        notes_good.append("You described an order of steps, which makes an answer easy to follow.")
    else:
        notes_fix.append("Walk through your approach in clear steps (first, then, finally) so the interviewer can follow your thinking.")
    if re.search(r"\d", answer) or re.search(r"\b(percent|faster|reduced|improved|saved|users|hours|minutes)\b", low):
        notes_good.append("You included something measurable, which makes it credible.")
    else:
        notes_fix.append("Add a concrete detail or number: how big, how fast, how many, or what changed afterwards.")
    if re.search(r"\bbecause\b|\btrade.?off\b|\bhowever\b|\binstead\b|\balternative", low):
        notes_good.append("You explained a reason or tradeoff, not just what you did.")
    else:
        notes_fix.append("Say why you chose that approach and what the alternative was. Interviewers listen for the reasoning.")
    if not re.search(r"\bi (would|did|built|used|wrote|chose|decided|tested|checked|fixed)\b", low):
        notes_fix.append("Use \"I\" statements for your own actions so it is clear what you personally did.")
    if words < 40:
        notes_fix.append(f"It is quite short at about {words} words. Aim for roughly 120 to 200 words when written, which is about a minute spoken.")
    msg = "I can't judge technical correctness in this mode, but here is feedback on how the answer is built.\n\n"
    if notes_good:
        msg += "What works:\n" + _bullets(notes_good) + "\n\n"
    if notes_fix:
        msg += "What to improve:\n" + _bullets(notes_fix) + "\n\n"
    msg += "Revise it with those points and send it again, or ask for another question."
    return _reply(msg, intent="interview_feedback", follow_ups=["Give me another question", "Here is my revised answer"])


def _career_line(c: dict[str, Any]) -> str:
    bits = [c.get("summary", "").strip()]
    meta = []
    if c.get("avg_timeline_weeks"):
        meta.append(f"about {c['avg_timeline_weeks']} weeks to become job ready on the catalogue estimate")
    if c.get("difficulty"):
        meta.append(f"difficulty {c['difficulty']} out of 5")
    if c.get("entry_roles"):
        meta.append("typical first roles: " + ", ".join(c["entry_roles"][:3]))
    if c.get("tools"):
        meta.append("common tools: " + ", ".join(c["tools"][:4]))
    return " ".join(b for b in bits if b) + ("\n" + _bullets(meta) if meta else "")


def _career(low: str, careers: list[dict[str, Any]], ctx: dict[str, Any], first: str) -> MentorReply:
    parts: list[str] = []
    if len(careers) >= 2:
        a, b = careers[0], careers[1]
        parts.append(f"Here is how {a['name']} and {b['name']} compare on what CareerFound lists for each.")
        parts.append(f"{a['name']}:\n{_career_line(a)}")
        parts.append(f"{b['name']}:\n{_career_line(b)}")
        parts.append(
            "A way to choose: spend one weekend on a small beginner task in each, then notice which one you kept going on after it got hard. "
            "Interest that survives difficulty is a better signal than the job title. Also check which entry roles you could realistically apply for within a year."
        )
        parts.append("Two questions to help me narrow it: do you prefer building things or protecting and operating them, and how many hours a week can you commit?")
        return _reply("\n\n".join(parts), intent="career_compare",
                      follow_ups=[f"What would I learn first in {a['name']}?", f"What would I learn first in {b['name']}?", "Which suits a complete beginner?"])
    if careers:
        c = careers[0]
        parts.append(f"{c['name']}, as CareerFound describes it:\n{_career_line(c)}")
        if c.get("skills_required"):
            parts.append("Skills employers look for: " + ", ".join(c["skills_required"][:6]) + ".")
        if re.search(r"salary|how much|earn|pay", low) and c.get("earning_notes"):
            parts.append("On pay: " + c["earning_notes"])
        elif re.search(r"salary|how much|earn|pay", low):
            parts.append("I do not have reliable salary figures for this role, and pay varies a lot by country and employer, so check recent job listings in your market.")
        if ctx.get("path_slug") == c["slug"]:
            parts.append("This is the path you are already on, so the most useful next step is your next unfinished roadmap item.")
        else:
            parts.append("If this interests you, a good first step is the Find Your Tech Path assessment, or the career page, to see the beginner roadmap.")
        return _reply("\n\n".join(parts), intent="career_info", follow_ups=[f"What is the first thing to learn for {c['name']}?", "How does it compare with another career?"])
    # General guidance
    if re.search(r"too (old|late)|at \d{2}|in my (30|40|50)", low):
        parts.append(
            "There is no age cutoff for tech. Employers hire for skills they can see, so what matters is a small set of fundamentals, one or two real projects, and the ability to explain what you did."
        )
        parts.append("People change careers into tech from every background. Your previous work is an asset when you aim at a role that uses it, for example operations experience for IT or cloud, or teaching experience for technical writing.")
    elif re.search(r"salary|how much|earn|pay", low):
        parts.append(
            "I can't give you a reliable salary figure without knowing the role, country and level, and numbers I would make up are worse than none. Search recent job postings for the exact title in your city or remote market, and note the range."
        )
    else:
        parts.append("To choose a direction, start from what you enjoy doing for hours, not from the job title.")
    if ctx.get("path_name"):
        parts.append(f"You are already working on {ctx['path_name']}, so a strong option is to finish its first phase before deciding whether to switch.")
    else:
        parts.append("The Find Your Tech Path assessment on CareerFound turns your interests, strengths and available time into three suggestions with reasons.")
    parts.append("To give you something sharper: what have you done before, how many hours a week can you study, and do you want a job, freelance work, or both?")
    return _reply("\n\n".join(parts), intent="career_guidance",
                  follow_ups=["Compare two careers for me", "What is a realistic first job?", "How do I start with no experience?"])


def _roadmap(low: str, ctx: dict[str, Any], first: str) -> MentorReply:
    parts: list[str] = []
    if ctx.get("path_name"):
        total, done = ctx.get("lessons_total") or 0, ctx.get("lessons_done") or 0
        prog = f" You have completed {done} of {total} lessons." if total else ""
        parts.append(f"You are on the {ctx['path_name']} path.{prog}")
        if ctx.get("current_phase"):
            parts.append(f"Your current focus phase is \"{ctx['current_phase']}\". Finish it in order, because each step uses the one before.")
        if ctx.get("next_tasks"):
            parts.append("Your next unfinished items:\n" + _bullets(ctx["next_tasks"][:3]))
        if ctx.get("current_project"):
            parts.append(f"The project waiting for you is \"{ctx['current_project']['title']}\". Doing it right after the related lesson makes the idea stick.")
        if re.search(r"how long|how many (weeks|months|hours)", low) and ctx.get("path_weeks"):
            parts.append(
                f"On timing: the catalogue estimate for {ctx['path_name']} is about {ctx['path_weeks']} weeks to job ready, but that depends heavily on your weekly hours, so treat it as a rough guide, not a promise."
            )
        parts.append("Which of these feels hardest right now? I can break that one into smaller steps.")
        return _reply("\n\n".join(parts), intent="roadmap", follow_ups=["Break the next lesson into smaller steps", "How should I split my week?"])
    parts.append("You don't have an active roadmap yet, so I can only give general direction until you pick a path.")
    parts.append(
        "A sound order for any tech path: 1) pick one direction, 2) learn its fundamentals in a fixed order, 3) build one small project after each block, 4) publish the work on GitHub with a clear README, 5) practise interview questions for the role."
    )
    parts.append("The Find Your Tech Path assessment will give you a personalised roadmap on CareerFound. After that I can tell you exactly what to do next, using your real progress.")
    return _reply("\n\n".join(parts), intent="roadmap_general", follow_ups=["How do I pick a path?", "How many hours a week do I need?"])


def _project(low: str, topic: Topic | None, ctx: dict[str, Any], first: str) -> MentorReply:
    proj = ctx.get("current_project")
    mentions_current = bool(proj) and any(w in low for w in re.findall(r"[a-z]{4,}", proj["title"].lower()))
    if _PROJECT_IDEAS.search(low):
        titles = ctx.get("path_project_titles") or []
        if titles:
            msg = (
                f"Projects that fit your {ctx.get('path_name', 'path')} roadmap on CareerFound:\n{_bullets(titles[:4])}\n\n"
                "Pick one, then make it yours: add one feature nobody asked for and write a README that explains the problem, how to run it, and what you learned. "
                "Which one matches what you want to be able to say in an interview?"
            )
        else:
            msg = (
                "A good portfolio project solves a small, real problem and can be run by a stranger. Pick something you personally need, keep the first version to one weekend, "
                "then improve it in steps. Publish it with a README covering the problem, how to run it, and what you would do next.\n\n"
                "Tell me what you enjoy or what you are learning, and I will help you shape one idea into a plan."
            )
        return _reply(msg, intent="project_ideas", follow_ups=["Help me scope the first version", "What should the README contain?"])
    if proj and (mentions_current or "my project" in low or "the project" in low):
        parts = [f"On \"{proj['title']}\": it teaches {proj.get('teaches', 'the skills for this phase').rstrip('.')}."]
        if proj.get("steps"):
            parts.append("The planned steps:\n" + _bullets([str(s) for s in proj["steps"][:5]]))
        if proj.get("hints"):
            parts.append("A hint before the answer: " + str(proj["hints"][0]))
        if proj.get("common_mistakes"):
            parts.append("A common mistake here: " + str(proj["common_mistakes"][0]))
        parts.append("Which step are you on, and what have you tried so far? If you paste your approach or code, I will point out what to check, without just handing you the finished solution.")
        return _reply("\n\n".join(parts), intent="project_help", follow_ups=["Here is my approach", "I am stuck on step 1"])
    msg = (
        "I can help with a project, but I need to know which one and where you are.\n\n"
        "- What is the project meant to do?\n- Which step are you on?\n- What have you tried and what happened?\n\n"
        "If you have code, paste the relevant part and the exact error or behaviour you see."
    )
    if topic:
        msg += f"\n\nIf it involves {topic.title}: {topic.mistake}"
    return _reply(msg, topic=topic.key if topic else None, intent="project_clarify", follow_ups=["Give me project ideas", "What should my README contain?"])


def _cv(low: str, ctx: dict[str, Any]) -> MentorReply:
    parts: list[str] = []
    if re.search(r"gap", low):
        parts.append("A gap is not a problem if you handle it plainly: one honest line (for example caring for family, studying, or health), then show what you did to keep learning, such as courses or projects with dates.")
    elif re.search(r"readme|github", low):
        parts.append("A README that gets read: the problem in one sentence, a screenshot or demo, how to run it in three commands, the main design choice and why, and what you would do next.")
    elif re.search(r"linkedin", low):
        parts.append("Make the headline say what you do and what you are aiming at, not just \"student\". Pin two projects with links, and write the About section in the first person with one concrete outcome.")
    else:
        parts.append("For an entry level technical CV: one page, a short summary aimed at the specific role, skills that match the job ad, two or three projects with a link and one measurable result each, then education and any work history.")
    skills = ctx.get("declared_skills") or []
    if skills:
        parts.append("Skills you have listed on CareerFound: " + ", ".join(skills[:8]) + ". Only keep the ones you can talk about for two minutes in an interview.")
    certs = ctx.get("certifications") or []
    if certs:
        parts.append("Certifications on your profile: " + ", ".join(certs[:4]) + ".")
    parts.append("Paste a section of your CV or README and I will tell you what is vague. I will not invent achievements for you, so use only things that are true.")
    return _reply("\n\n".join(parts), intent="cv", follow_ups=["Here is my CV summary", "How do I describe a project?"])


def _unclear(text: str, ctx: dict[str, Any], first: str) -> MentorReply:
    names = ", ".join(t.title for t in TOPICS[:10])
    msg = (
        "I don't have prepared guidance for that exact question, and I would rather say so than give you a generic answer. "
        "A live AI model is not switched on, so I work from prepared material.\n\n"
        "Help me aim it: what are you trying to do, what have you tried, and what happened? If it is a concept, name it. If it is an error, paste the exact text.\n\n"
        f"I can go into detail on topics such as {names}, and also on errors, interview practice, projects, CVs and choosing a career."
    )
    facts = _facts(ctx)
    if facts:
        msg += "\n\n" + facts
    return _reply(msg, intent="unclear", follow_ups=["Explain a concept", "I have an error message", "Give me an interview question"])
