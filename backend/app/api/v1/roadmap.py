import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.career import CareerPath
from app.models.progress import ProgressStatus
from app.models.roadmap import Exercise, Lesson, Project, Quiz, RoadmapPhase
from app.models.user import User
from app.schemas.roadmap import (
    ExerciseOut,
    GenerateRoadmapRequest,
    LessonOut,
    PhaseOut,
    ProjectOut,
    QuizOut,
    RoadmapCustomItemOut,
    RoadmapOut,
    SubmitExerciseRequest,
    SubmitQuizRequest,
)
from app.services import roadmap_service

router = APIRouter(tags=["roadmap"])


def _quiz_out_without_answers(quiz: Quiz, status_value: str) -> QuizOut:
    """Never ship `correct_option` to the client — scoring happens
    server-side in POST /quizzes/{id}/submit. Shipping answers in the GET
    response would let anyone view-source their way to a perfect score.
    """
    sanitized_questions = [
        {k: v for k, v in q.items() if k != "correct_option"} for q in quiz.questions
    ]
    return QuizOut.model_validate(quiz).model_copy(update={"status": status_value, "questions": sanitized_questions})


async def _serialize_roadmap(db: AsyncSession, roadmap, path: CareerPath, user_id: uuid.UUID) -> RoadmapOut:
    progress_map = await roadmap_service.get_progress_map(db, user_id)

    phases_result = await db.execute(
        select(RoadmapPhase).where(RoadmapPhase.path_id == path.id).order_by(RoadmapPhase.order_index)
    )
    phases = phases_result.scalars().all()

    phase_outs = []
    for phase in phases:
        lessons = (
            (await db.execute(select(Lesson).where(Lesson.phase_id == phase.id).order_by(Lesson.order_index)))
            .scalars()
            .all()
        )
        projects = (
            (await db.execute(select(Project).where(Project.phase_id == phase.id).order_by(Project.order_index)))
            .scalars()
            .all()
        )
        quizzes = (
            (await db.execute(select(Quiz).where(Quiz.phase_id == phase.id))).scalars().all()
        )

        lesson_outs = [
            LessonOut.model_validate(l).model_copy(
                update={"status": progress_map.get(str(l.id), ProgressStatus.not_started).value}
            )
            for l in lessons
        ]
        project_outs = [
            ProjectOut.model_validate(p).model_copy(
                update={"status": progress_map.get(str(p.id), ProgressStatus.not_started).value}
            )
            for p in projects
        ]
        quiz_outs = [
            _quiz_out_without_answers(q, progress_map.get(str(q.id), ProgressStatus.not_started).value)
            for q in quizzes
        ]

        total_items = len(lesson_outs) + len(project_outs) + len(quiz_outs)
        done_items = sum(
            1
            for item in (*lesson_outs, *project_outs, *quiz_outs)
            if item.status == ProgressStatus.completed.value
        )
        progress_pct = round((done_items / total_items) * 100) if total_items else 0

        phase_outs.append(
            PhaseOut(
                id=phase.id,
                order_index=phase.order_index,
                title=phase.title,
                summary=phase.summary,
                lessons=lesson_outs,
                projects=project_outs,
                quizzes=quiz_outs,
                progress_pct=progress_pct,
            )
        )

    return RoadmapOut(
        id=roadmap.id,
        path_slug=path.slug,
        path_name=path.name,
        status=roadmap.status.value,
        phases=phase_outs,
    )


@router.post("/roadmaps", response_model=RoadmapOut, status_code=status.HTTP_201_CREATED)
async def create_roadmap(
    payload: GenerateRoadmapRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        roadmap = await roadmap_service.generate_roadmap(db, user.id, payload.path_slug)
    except roadmap_service.RoadmapError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    path = (await db.execute(select(CareerPath).where(CareerPath.id == roadmap.path_id))).scalar_one()
    return await _serialize_roadmap(db, roadmap, path, user.id)


@router.get("/roadmaps/active", response_model=RoadmapOut)
async def active_roadmap(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    roadmap = await roadmap_service.get_active_roadmap(db, user.id)
    if roadmap is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No active roadmap. Complete the assessment and choose a path first.")
    path = (await db.execute(select(CareerPath).where(CareerPath.id == roadmap.path_id))).scalar_one()
    return await _serialize_roadmap(db, roadmap, path, user.id)


@router.get("/lessons/{lesson_id}", response_model=LessonOut)
async def get_lesson(lesson_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    lesson = (await db.execute(select(Lesson).where(Lesson.id == lesson_id))).scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
    progress_map = await roadmap_service.get_progress_map(db, user.id)
    return LessonOut.model_validate(lesson).model_copy(
        update={"status": progress_map.get(str(lesson.id), ProgressStatus.not_started).value}
    )


@router.get("/lessons/{lesson_id}/exercises", response_model=list[ExerciseOut])
async def get_lesson_exercises(lesson_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    exercises = (
        (await db.execute(select(Exercise).where(Exercise.lesson_id == lesson_id).order_by(Exercise.created_at)))
        .scalars()
        .all()
    )
    progress_map = await roadmap_service.get_progress_map(db, user.id)
    return [
        ExerciseOut.model_validate(e).model_copy(
            update={"status": progress_map.get(str(e.id), ProgressStatus.not_started).value}
        )
        for e in exercises
    ]


@router.get("/projects/{project_id}", response_model=ProjectOut)
async def get_project(project_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if project is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    progress_map = await roadmap_service.get_progress_map(db, user.id)
    return ProjectOut.model_validate(project).model_copy(
        update={"status": progress_map.get(str(project.id), ProgressStatus.not_started).value}
    )


@router.get("/quizzes/{quiz_id}", response_model=QuizOut)
async def get_quiz(quiz_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    quiz = (await db.execute(select(Quiz).where(Quiz.id == quiz_id))).scalar_one_or_none()
    if quiz is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quiz not found")
    progress_map = await roadmap_service.get_progress_map(db, user.id)
    return _quiz_out_without_answers(quiz, progress_map.get(str(quiz.id), ProgressStatus.not_started).value)


@router.post("/lessons/{lesson_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
async def complete_lesson(lesson_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        await roadmap_service.complete_lesson(db, user.id, lesson_id)
    except roadmap_service.RoadmapError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.post("/exercises/{exercise_id}/submit")
async def submit_exercise(
    exercise_id: uuid.UUID,
    payload: SubmitExerciseRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        correct = await roadmap_service.submit_exercise(db, user.id, exercise_id, payload.answer)
    except roadmap_service.RoadmapError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return {"correct": correct}


@router.post("/projects/{project_id}/submit", status_code=status.HTTP_204_NO_CONTENT)
async def submit_project(project_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        await roadmap_service.submit_project(db, user.id, project_id)
    except roadmap_service.RoadmapError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.post("/quizzes/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: uuid.UUID,
    payload: SubmitQuizRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        score = await roadmap_service.submit_quiz(db, user.id, quiz_id, payload.answers)
    except roadmap_service.RoadmapError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return {"score": score}


@router.get("/roadmaps/{roadmap_id}/custom-items", response_model=list[RoadmapCustomItemOut])
async def list_custom_items(roadmap_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """The 'From your mentor' section — items a mentor recommended that this
    user has pulled into their roadmap. Separate from the shared phase
    content above, see RoadmapCustomItem's docstring."""
    return await roadmap_service.list_custom_items(db, user.id, roadmap_id)


@router.post(
    "/mentor-recommendations/{recommendation_id}/items/{item_index}/accept",
    response_model=RoadmapCustomItemOut,
    status_code=status.HTTP_201_CREATED,
)
async def accept_recommendation_item(
    recommendation_id: uuid.UUID,
    item_index: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await roadmap_service.accept_recommendation_item(db, user.id, recommendation_id, item_index)
    except roadmap_service.RoadmapError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
