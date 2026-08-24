import uuid

from pydantic import BaseModel, computed_field

from app.schemas.career import CareerPathOut


class GenerateRoadmapRequest(BaseModel):
    path_slug: str


class LessonOut(BaseModel):
    id: uuid.UUID
    order_index: int
    title: str
    concept_summary: str
    beginner_explainer: str
    content_md: str
    est_minutes: int
    status: str = "not_started"

    model_config = {"from_attributes": True}


class ProjectOut(BaseModel):
    id: uuid.UUID
    order_index: int
    title: str
    teaches: str
    prerequisites: list[str]
    expected_output: str
    steps: list[str]
    hints: list[str]
    common_mistakes: list[str]
    difficulty: int
    status: str = "not_started"

    model_config = {"from_attributes": True}

    @computed_field  # type: ignore[misc]
    @property
    def difficulty_label(self) -> str:
        """Beginner/Intermediate/Expert tier derived from the raw 1-5
        difficulty score, so the frontend never has to hardcode the mapping.
        """
        if self.difficulty <= 2:
            return "Beginner"
        if self.difficulty == 3:
            return "Intermediate"
        return "Expert"

    @computed_field  # type: ignore[misc]
    @property
    def estimated_duration(self) -> str:
        """A rough, honest time estimate derived from the same 1-5 difficulty
        score as difficulty_label, not a precisely measured figure. Shown on
        project cards so a project browser has a sense of scope before
        starting, the same way difficulty_label avoids hardcoding a tier
        mapping in the frontend.
        """
        if self.difficulty <= 2:
            return "3 to 5 hours"
        if self.difficulty == 3:
            return "6 to 10 hours"
        return "10+ hours"


class CareerProjectOut(ProjectOut):
    """A project shown in a career path's public project catalog (Beginner /
    Intermediate / Expert), independent of any user's roadmap progress —
    used by GET /careers/{slug}/projects so a path can be browsed before a
    roadmap is even generated.
    """

    phase_title: str = ""


class RoleProjectCatalogEntry(BaseModel):
    """One career role/path plus every project available for it, used by
    GET /careers/projects/catalog to power the "Projects by Role" discovery
    page in a single request instead of one call per role.
    """

    path: CareerPathOut
    projects: list[CareerProjectOut]


class QuizOut(BaseModel):
    id: uuid.UUID
    title: str
    passing_score: int
    questions: list[dict]
    status: str = "not_started"

    model_config = {"from_attributes": True}


class PhaseOut(BaseModel):
    id: uuid.UUID
    order_index: int
    title: str
    summary: str
    lessons: list[LessonOut] = []
    projects: list[ProjectOut] = []
    quizzes: list[QuizOut] = []
    progress_pct: int = 0

    model_config = {"from_attributes": True}


class RoadmapOut(BaseModel):
    id: uuid.UUID
    path_slug: str
    path_name: str
    status: str
    phases: list[PhaseOut]

    model_config = {"from_attributes": True}


class SubmitExerciseRequest(BaseModel):
    answer: str


class SubmitQuizRequest(BaseModel):
    answers: dict[str, str]


class ExerciseOut(BaseModel):
    id: uuid.UUID
    prompt: str
    type: str
    options: list[str]
    est_minutes: int
    status: str = "not_started"

    model_config = {"from_attributes": True}


class RoadmapCustomItemOut(BaseModel):
    """A mentor-recommended action the mentee has accepted into their
    roadmap — rendered in a separate 'From your mentor' section, distinct
    from the shared phase/lesson/project template content above."""

    id: uuid.UUID
    title: str
    description: str
    item_type: str
    status: str
    order_index: int

    model_config = {"from_attributes": True}
