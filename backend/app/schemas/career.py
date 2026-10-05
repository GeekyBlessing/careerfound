import uuid

from pydantic import BaseModel, model_validator

from app.services.career_taxonomy import category_label


class LearningResourceOut(BaseModel):
    label: str
    note: str


class RoadmapOutlineOut(BaseModel):
    beginner: list[str] = []
    intermediate: list[str] = []
    advanced: list[str] = []


class CareerPathOut(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    summary: str
    beginner_summary: str
    difficulty: int
    avg_timeline_weeks: int
    entry_roles: list[str]
    tools: list[str]
    remote_potential: int
    earning_notes: str
    icon: str
    skills_required: list[str] = []
    certifications: list[str] = []
    interview_prep: list[str] = []
    learning_resources: list[LearningResourceOut] = []
    roadmap_outline: RoadmapOutlineOut = RoadmapOutlineOut()
    category: str = ""
    category_label: str = ""
    related_slugs: list[str] = []
    keywords: list[str] = []
    who_its_for: str = ""
    portfolio_expectations: list[str] = []
    career_progression: list[str] = []

    @model_validator(mode="after")
    def _fill_category_label(self):
        if not self.category_label:
            self.category_label = category_label(self.category)
        return self

    model_config = {"from_attributes": True}
