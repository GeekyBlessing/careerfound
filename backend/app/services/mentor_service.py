import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.client import get_llm_client
from app.models.ai import AIConversation, AIMessage
from app.models.roadmap import Project
from app.models.user import User


async def get_or_create_conversation(
    db: AsyncSession, user_id: uuid.UUID, conversation_id: uuid.UUID | None, kind: str = "mentor"
) -> AIConversation:
    if conversation_id:
        result = await db.execute(
            select(AIConversation).where(AIConversation.id == conversation_id, AIConversation.user_id == user_id)
        )
        convo = result.scalar_one_or_none()
        if convo:
            return convo
    convo = AIConversation(user_id=user_id, kind=kind)
    db.add(convo)
    await db.commit()
    await db.refresh(convo)
    return convo


async def get_history(db: AsyncSession, conversation_id: uuid.UUID) -> list[AIMessage]:
    result = await db.execute(
        select(AIMessage).where(AIMessage.conversation_id == conversation_id).order_by(AIMessage.created_at)
    )
    return list(result.scalars().all())


async def send_message(db: AsyncSession, user: User, conversation_id: uuid.UUID | None, message: str) -> tuple[AIConversation, str, list[str], list[AIMessage]]:
    convo = await get_or_create_conversation(db, user.id, conversation_id, kind="mentor")
    history = await get_history(db, convo.id)

    db.add(AIMessage(conversation_id=convo.id, role="user", content=message))
    await db.commit()

    llm = get_llm_client()
    history_payload = [{"role": m.role, "content": m.content} for m in history]
    user_context = {
        "full_name": user.full_name,
        "beginner_mode": user.beginner_mode,
        "persona": user.persona.value if user.persona else None,
    }
    result = await llm.mentor_reply(history_payload, message, user_context)

    meta = {}
    if result.detected_struggle:
        meta["detected_struggle"] = result.detected_struggle
    if result.suggested_roadmap_adjustment:
        meta["suggested_roadmap_adjustment"] = result.suggested_roadmap_adjustment

    db.add(AIMessage(conversation_id=convo.id, role="assistant", content=result.message, meta=meta))
    await db.commit()

    full_history = await get_history(db, convo.id)
    return convo, result.message, result.follow_up_questions, full_history


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
