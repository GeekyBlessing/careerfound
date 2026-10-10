import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import get_llm_client
from app.ai.providers import MentorUnavailable
from app.models.ai import AIConversation, AIMessage
from app.models.career import CareerPath
from app.models.career_profile import UserCertification, UserSkill
from app.models.progress import ProgressStatus, XPEvent
from app.models.roadmap import Lesson, Project, Roadmap, RoadmapPhase, RoadmapStatus
from app.models.user import User
from app.services import dashboard_service, roadmap_service


logger = logging.getLogger("careerfound.mentor")


async def get_conversation(db: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID | None) -> AIConversation | None:
    """An existing conversation that belongs to this user, or None. A new one
    is only created once the mentor has actually answered, so a failed model
    call leaves nothing half saved behind."""
    if not conversation_id:
        return None
    result = await db.execute(
        select(AIConversation).where(AIConversation.id == conversation_id, AIConversation.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_history(db: AsyncSession, conversation_id: uuid.UUID) -> list[AIMessage]:
    result = await db.execute(
        select(AIMessage).where(AIMessage.conversation_id == conversation_id).order_by(AIMessage.created_at, AIMessage.id)
    )
    return list(result.scalars().all())


async def build_mentor_context(db: AsyncSession, user: User) -> dict:
    """Real facts about this learner for the mentor. Everything here comes
    from the database; a field that does not exist is left out, never
    guessed. The catalogue is included for the limited mode's career
    comparisons and is not sent to a live model."""
    ctx: dict = {
        "full_name": user.full_name,
        "beginner_mode": user.beginner_mode,
        "experience": "beginner" if user.beginner_mode else "experienced",
        "persona": user.persona.value if user.persona else None,
        "goal": user.goal.value if user.goal else None,
    }

    catalogue = (await db.execute(select(CareerPath).where(CareerPath.is_active.is_(True)))).scalars().all()
    ctx["career_catalogue"] = [
        {
            "slug": c.slug,
            "name": c.name,
            "summary": (c.beginner_summary or c.summary or "").strip(),
            "difficulty": c.difficulty,
            "avg_timeline_weeks": c.avg_timeline_weeks,
            "entry_roles": list(c.entry_roles or []),
            "tools": list(c.tools or []),
            "skills_required": list(c.skills_required or []),
            "earning_notes": c.earning_notes or "",
        }
        for c in catalogue
    ]

    roadmap = (
        await db.execute(
            select(Roadmap).where(Roadmap.user_id == user.id, Roadmap.status == RoadmapStatus.active).order_by(Roadmap.created_at.desc())
        )
    ).scalars().first()
    if roadmap is not None:
        path = next((c for c in catalogue if c.id == roadmap.path_id), None) or (
            await db.execute(select(CareerPath).where(CareerPath.id == roadmap.path_id))
        ).scalar_one_or_none()
        if path is not None:
            ctx.update(
                path_name=path.name,
                path_slug=path.slug,
                path_summary=(path.beginner_summary or path.summary or "").strip(),
                path_weeks=path.avg_timeline_weeks,
                interview_prep=list(path.interview_prep or []),
            )
            progress = await roadmap_service.get_progress_map(db, user.id)
            phases = (
                await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id).order_by(RoadmapPhase.order_index))
            ).scalars().all()
            lessons_total = lessons_done = 0
            current_phase = None
            current_project = None
            project_titles: list[str] = []
            for phase in phases:
                lesson_ids = [row[0] for row in (await db.execute(select(Lesson.id).where(Lesson.phase_id == phase.id))).all()]
                lessons_total += len(lesson_ids)
                done_here = sum(1 for lid in lesson_ids if progress.get(str(lid)) == ProgressStatus.completed)
                lessons_done += done_here
                if current_phase is None and done_here < len(lesson_ids):
                    current_phase = phase.title
                projects = (await db.execute(select(Project).where(Project.phase_id == phase.id).order_by(Project.order_index))).scalars().all()
                for project in projects:
                    project_titles.append(project.title)
                    if current_project is None and progress.get(str(project.id)) != ProgressStatus.completed:
                        current_project = {
                            "title": project.title,
                            "teaches": project.teaches,
                            "steps": list(project.steps or []),
                            "hints": list(project.hints or []),
                            "common_mistakes": list(project.common_mistakes or []),
                        }
            ctx.update(
                lessons_total=lessons_total,
                lessons_done=lessons_done,
                current_phase=current_phase,
                current_project=current_project,
                path_project_titles=project_titles,
            )
            try:
                tasks = await dashboard_service._next_incomplete_items(db, path.id, user.id, limit=3)
                ctx["next_tasks"] = [t["title"] for t in tasks if t.get("ref_id")]
            except Exception:  # context is a bonus; never block the answer on it
                logger.exception("Could not build next tasks for mentor context")

    skills = (await db.execute(select(UserSkill).where(UserSkill.user_id == user.id))).scalars().all()
    ctx["declared_skills"] = [f"{s.name} ({s.level})" for s in skills]
    certs = (await db.execute(select(UserCertification).where(UserCertification.user_id == user.id))).scalars().all()
    ctx["certifications"] = [f"{c.name} ({c.status.replace('_', ' ')})" for c in certs]
    events = (await db.execute(select(XPEvent).where(XPEvent.user_id == user.id).order_by(XPEvent.created_at.desc()).limit(3))).scalars().all()
    ctx["recent_activity"] = [e.reason for e in events]
    return ctx


async def send_message(db: AsyncSession, user: User, conversation_id: uuid.UUID | None, message: str):
    """One mentor turn. The model is asked first; only if it answers are the
    learner's message and the reply saved, together and in order. If it fails,
    MentorUnavailable propagates with nothing saved, so the page can offer a
    clean retry and the history never holds a question that has no answer."""
    convo = await get_conversation(db, user.id, conversation_id)
    history = await get_history(db, convo.id) if convo else []
    history_payload = [{"role": m.role, "content": m.content, "meta": m.meta or {}} for m in history]

    ctx = await build_mentor_context(db, user)
    llm = get_llm_client()
    try:
        result = await llm.mentor_reply(history_payload, message, ctx)
    except MentorUnavailable:
        raise
    except Exception as exc:
        logger.exception("Mentor reply failed for user %s", user.id)
        raise MentorUnavailable("The AI Mentor could not answer.", "ai_unavailable") from exc

    if convo is None:
        convo = AIConversation(user_id=user.id, kind="mentor")
        db.add(convo)
        await db.flush()

    meta: dict = {"mode": result.mode}
    if result.topic:
        meta["topic"] = result.topic
    if result.intent:
        meta["intent"] = result.intent
    if result.detected_struggle:
        meta["detected_struggle"] = result.detected_struggle
    if result.suggested_roadmap_adjustment:
        meta["suggested_roadmap_adjustment"] = result.suggested_roadmap_adjustment

    # Explicit, strictly increasing timestamps: both rows are committed in one
    # transaction, where the database's own now() would be identical for both
    # and make their order ambiguous.
    now = datetime.now(timezone.utc)
    db.add(AIMessage(conversation_id=convo.id, role="user", content=message, created_at=now))
    db.add(AIMessage(conversation_id=convo.id, role="assistant", content=result.message, meta=meta, created_at=now + timedelta(milliseconds=1)))
    await db.commit()

    full_history = await get_history(db, convo.id)
    return convo, result, full_history


async def review_project(db: AsyncSession, user: User, project_id: uuid.UUID, submission_text: str):
    project = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if project is None:
        raise ValueError("Project not found.")

    llm = get_llm_client()
    context = {
        "teaches": project.teaches,
        "skill_hint": project.title,
        "skills_demonstrated": [],
        "next_project_hint": "Check your roadmap for the next project in this phase.",
    }
    review = await llm.review_project(project.title, context, submission_text)

    convo = AIConversation(user_id=user.id, kind="review")
    db.add(convo)
    await db.commit()
    await db.refresh(convo)
    db.add(AIMessage(conversation_id=convo.id, role="user", content=submission_text))
    db.add(AIMessage(conversation_id=convo.id, role="assistant", content=review.overall_assessment, meta=review.model_dump()))
    await db.commit()

    return review
