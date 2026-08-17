import uuid
from datetime import datetime

from pydantic import BaseModel


class AssessmentAnswers(BaseModel):
    """The full 'Find Your Tech Path' questionnaire. All fields optional at
    the schema level so the frontend can submit partial progress, but the
    service layer requires the core fields before scoring.
    """

    age_range: str | None = None
    education_level: str | None = None
    occupation: str | None = None
    country: str | None = None
    time_budget_minutes_per_day: int | None = None
    device_access: str | None = None
    internet_quality: str | None = None
    current_technical_knowledge: str | None = None
    monthly_budget_usd: float | None = None
    income_goal: str | None = None
    preferred_work_style: str | None = None
    things_enjoyed: list[str] = []
    things_disliked: list[str] = []
    enjoys_problem_solving: bool | None = None
    enjoys_math: bool | None = None
    enjoys_creativity: bool | None = None
    enjoys_people: bool | None = None
    prefers_systems: bool | None = None
    wants_remote: bool | None = None
    career_timeline: str | None = None
    existing_skills: list[str] = []
    risk_tolerant: bool | None = None


class AssessmentSubmitRequest(BaseModel):
    answers: AssessmentAnswers


class CareerRecommendationOut(BaseModel):
    path_slug: str
    tier: str
    fit_score: int
    why_it_fits: str
    transferable_skills: list[dict]
    skills_to_develop: list[str]
    difficulty_label: str
    timeline_label: str
    entry_roles: list[str]
    example_projects: list[str]
    tools: list[str]
    earning_notes: str
    remote_potential_label: str
    recommended_next_step: str


class AssessmentOut(BaseModel):
    id: uuid.UUID
    created_at: datetime
    career_dna: dict
    recommendations: list[CareerRecommendationOut]

    model_config = {"from_attributes": True}
