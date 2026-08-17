from pydantic import BaseModel


class AdminOverviewOut(BaseModel):
    total_users: int
    daily_active_users: int
    weekly_active_users: int
    total_assessments_completed: int
    total_roadmaps_started: int
    total_projects_completed: int
    total_lessons_completed: int
    most_popular_paths: list[dict]
    completion_rate_pct: float
    mentor_sessions_booked: int
    drop_off_by_phase: list[dict]
