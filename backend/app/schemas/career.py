import uuid

from pydantic import BaseModel


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

    model_config = {"from_attributes": True}
