import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerPath
from app.models.marketplace import MentorRecommendation
from app.models.progress import ProgressStatus, UserProgress, UserSkillProgress, XPEvent
from app.models.roadmap import (
    Exercise,
    Lesson,
    Project,
    Quiz,
    Roadmap,
    RoadmapCustomItem,
    RoadmapPhase,
    RoadmapStatus,
    SkillNode,
)
from app.services.streak_service import touch_streak


class RoadmapError(Exception):
    pass


async def generate_roadmap(db: AsyncSession, user_id: uuid.UUID, path_slug: str) -> Roadmap:
    result = await db.execute(select(CareerPath).where(CareerPath.slug == path_slug))
    path = result.scalar_one_or_none()
    if path is None:
        raise RoadmapError(f"Unknown career path '{path_slug}'.")

    phases_result = await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id))
    if not phases_result.scalars().first():
        raise RoadmapError(
            f"No roadmap content is seeded yet for '{path.name}'. This path is fully "
            "architected but content authoring hasn't happened for it yet, try "
            "Cybersecurity or Software Engineering, which are fully seeded."
        )

    existing = await db.execute(
        select(Roadmap).where(
            Roadmap.user_id == user_id, Roadmap.path_id == path.id, Roadmap.status == RoadmapStatus.active
        )
    )
    roadmap = existing.scalar_one_or_none()
    if roadmap:
        return roadmap

    roadmap = Roadmap(user_id=user_id, path_id=path.id, status=RoadmapStatus.active)
    db.add(roadmap)
    await db.commit()
    await db.refresh(roadmap)
    return roadmap


async def get_active_roadmap(db: AsyncSession, user_id: uuid.UUID) -> Roadmap | None:
    result = await db.execute(
        select(Roadmap).where(Roadmap.user_id == user_id, Roadmap.status == RoadmapStatus.active).order_by(Roadmap.created_at.desc())
    )
    return result.scalars().first()


async def get_progress_map(db: AsyncSession, user_id: uuid.UUID) -> dict[str, ProgressStatus]:
    result = await db.execute(select(UserProgress).where(UserProgress.user_id == user_id))
    progress_map: dict[str, ProgressStatus] = {}
    for row in result.scalars().all():
        for field in ("lesson_id", "project_id", "quiz_id", "exercise_id"):
            ref = getattr(row, field)
            if ref is not None:
                progress_map[str(ref)] = row.status
    return progress_map


async def _award_xp(db: AsyncSession, user_id: uuid.UUID, amount: int, reason: str) -> None:
    db.add(XPEvent(user_id=user_id, amount=amount, reason=reason))


async def _bump_skill(db: AsyncSession, user_id: uuid.UUID, skill_node_id: uuid.UUID | None, delta: int) -> None:
    if skill_node_id is None:
        return
    result = await db.execute(
        select(UserSkillProgress).where(
            UserSkillProgress.user_id == user_id, UserSkillProgress.skill_node_id == skill_node_id
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = UserSkillProgress(user_id=user_id, skill_node_id=skill_node_id, mastery_pct=0)
        db.add(row)
    row.mastery_pct = min(100, row.mastery_pct + delta)


async def complete_lesson(db: AsyncSession, user_id: uuid.UUID, lesson_id: uuid.UUID) -> None:
    lesson = (await db.execute(select(Lesson).where(Lesson.id == lesson_id))).scalar_one_or_none()
    if lesson is None:
        raise RoadmapError("Lesson not found.")

    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_id, UserProgress.lesson_id == lesson_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = UserProgress(user_id=user_id, lesson_id=lesson_id)
        db.add(row)
    row.status = ProgressStatus.completed
    row.completed_at = datetime.now(timezone.utc)

    await _bump_skill(db, user_id, lesson.skill_node_id, 15)
    await _award_xp(db, user_id, 10, f"Completed lesson: {lesson.title}")
    await touch_streak(db, user_id)
    await db.commit()


async def submit_project(db: AsyncSession, user_id: uuid.UUID, project_id: uuid.UUID) -> None:
    project = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if project is None:
        raise RoadmapError("Project not found.")

    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_id, UserProgress.project_id == project_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = UserProgress(user_id=user_id, project_id=project_id)
        db.add(row)
    row.status = ProgressStatus.completed
    row.completed_at = datetime.now(timezone.utc)

    await _bump_skill(db, user_id, project.skill_node_id, 25)
    await _award_xp(db, user_id, 40, f"Completed project: {project.title}")
    await touch_streak(db, user_id)
    await db.commit()


async def submit_quiz(db: AsyncSession, user_id: uuid.UUID, quiz_id: uuid.UUID, answers: dict[str, str]) -> float:
    quiz = (await db.execute(select(Quiz).where(Quiz.id == quiz_id))).scalar_one_or_none()
    if quiz is None:
        raise RoadmapError("Quiz not found.")

    correct = 0
    total = max(len(quiz.questions), 1)
    for q in quiz.questions:
        qid = str(q.get("id"))
        if answers.get(qid) == q.get("correct_option"):
            correct += 1
    score = round((correct / total) * 100, 1)

    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_id, UserProgress.quiz_id == quiz_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = UserProgress(user_id=user_id, quiz_id=quiz_id)
        db.add(row)
    row.status = ProgressStatus.completed if score >= quiz.passing_score else ProgressStatus.in_progress
    row.score = score
    row.completed_at = datetime.now(timezone.utc)

    if score >= quiz.passing_score:
        await _award_xp(db, user_id, 20, f"Passed checkpoint: {quiz.title}")
        await touch_streak(db, user_id)
    await db.commit()
    return score


async def submit_exercise(db: AsyncSession, user_id: uuid.UUID, exercise_id: uuid.UUID, answer: str) -> bool:
    exercise = (await db.execute(select(Exercise).where(Exercise.id == exercise_id))).scalar_one_or_none()
    if exercise is None:
        raise RoadmapError("Exercise not found.")

    is_correct = answer.strip().lower() == str(exercise.answer_key.get("value", "")).strip().lower()

    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_id, UserProgress.exercise_id == exercise_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        row = UserProgress(user_id=user_id, exercise_id=exercise_id)
        db.add(row)
    row.status = ProgressStatus.completed
    row.score = 100.0 if is_correct else 0.0
    row.completed_at = datetime.now(timezone.utc)

    if is_correct:
        await _award_xp(db, user_id, 5, "Completed practice exercise")
    await db.commit()
    return is_correct


# --- Mentor-recommendation → roadmap integration ---------------------------
#
# Recommendations a mentor makes after a session are NOT merged into the
# shared Project/Lesson/RoadmapPhase templates (those are seeded once per
# path and shared across every user). Instead, accepting a recommendation
# item creates a per-user RoadmapCustomItem, rendered as a separate "From
# your mentor" section on the roadmap page.


async def list_custom_items(db: AsyncSession, user_id: uuid.UUID, roadmap_id: uuid.UUID) -> list[RoadmapCustomItem]:
    result = await db.execute(
        select(RoadmapCustomItem)
        .where(RoadmapCustomItem.user_id == user_id, RoadmapCustomItem.roadmap_id == roadmap_id)
        .order_by(RoadmapCustomItem.order_index)
    )
    return list(result.scalars().all())


async def accept_recommendation_item(
    db: AsyncSession, user_id: uuid.UUID, recommendation_id: uuid.UUID, item_index: int
) -> RoadmapCustomItem:
    recommendation = (
        await db.execute(select(MentorRecommendation).where(MentorRecommendation.id == recommendation_id))
    ).scalar_one_or_none()
    if recommendation is None or recommendation.mentee_id != user_id:
        raise RoadmapError("Recommendation not found.")
    if item_index < 0 or item_index >= len(recommendation.items):
        raise RoadmapError("Recommendation item not found.")

    roadmap = await get_active_roadmap(db, user_id)
    if roadmap is None:
        raise RoadmapError("You need an active roadmap before adding a mentor recommendation to it.")

    item = recommendation.items[item_index]
    count = (
        await db.execute(
            select(RoadmapCustomItem).where(
                RoadmapCustomItem.user_id == user_id, RoadmapCustomItem.roadmap_id == roadmap.id
            )
        )
    ).scalars().all()

    custom_item = RoadmapCustomItem(
        user_id=user_id,
        roadmap_id=roadmap.id,
        source_recommendation_id=recommendation.id,
        title=item.get("title", "Recommended by your mentor"),
        description=item.get("description", ""),
        item_type=item.get("item_type", "follow_up"),
        status="pending",
        order_index=len(count),
    )
    db.add(custom_item)
    await db.commit()
    await db.refresh(custom_item)
    return custom_item
