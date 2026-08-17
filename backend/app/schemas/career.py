import uuid

from pydantic import BaseModel


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

    model_config = {"from_attributes": True}
