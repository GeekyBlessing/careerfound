import uuid

from pydantic import BaseModel


class MissionTask(BaseModel):
    type: str  # learn | practice | challenge | reflection
    title: str
    est_minutes: int
    done: bool = False
    ref_id: str | None = None


class TodayMissionOut(BaseModel):
    date: str
    total_minutes: int
    tasks: list[MissionTask]
    rationale: str


class SkillGraphNodeOut(BaseModel):
    id: uuid.UUID
    key: str
    label: str
    category: str
    mastery_pct: int


class SkillGraphEdgeOut(BaseModel):
    from_id: uuid.UUID
    to_id: uuid.UUID


class SkillGraphOut(BaseModel):
    nodes: list[SkillGraphNodeOut]
    edges: list[SkillGraphEdgeOut]


class ReadinessScoreOut(BaseModel):
    overall: int
    knowledge_pct: int
    projects_pct: int
    portfolio_pct: int
    interview_pct: int
    practical_pct: int
    next_actions: list[str]


class DashboardOut(BaseModel):
    greeting: str
    has_active_roadmap: bool
    path_name: str | None = None
    path_slug: str | None = None
    today_mission: TodayMissionOut | None = None
    readiness: ReadinessScoreOut | None = None
    current_streak_days: int
    current_project_title: str | None = None
    upcoming_milestone: str | None = None
    recommended_next_action: str
