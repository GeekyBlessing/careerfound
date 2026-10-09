import uuid

from pydantic import BaseModel, model_validator

from app.services.career_depth import content_depth, has_project_lab
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
    # How much learning content sits behind this career today: "full" is a
    # complete lesson, quiz and Project Lab curriculum; "guided" is the stage
    # by stage roadmap with three graded projects. Shown on the career page.
    depth: str = "guided"
    project_lab: bool = False

    @model_validator(mode="after")
    def _fill_derived_fields(self):
        if not self.category_label:
            self.category_label = category_label(self.category)
        self.depth = content_depth(self.slug)
        self.project_lab = has_project_lab(self.slug)
        return self

    model_config = {"from_attributes": True}
