import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MentorChatRequest(BaseModel):
    conversation_id: uuid.UUID | None = None
    message: str = Field(min_length=1, max_length=4000)


class MentorChatMessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime


class MentorChatResponse(BaseModel):
    conversation_id: uuid.UUID
    reply: str
    follow_up_questions: list[str]
    history: list[MentorChatMessageOut]


class ProjectReviewRequest(BaseModel):
    submission_text: str = Field(min_length=1, max_length=20000)


class ProjectReviewFindingOut(BaseModel):
    severity: str
    comment: str


class ProjectReviewResponse(BaseModel):
    overall_assessment: str
    findings: list[ProjectReviewFindingOut]
    skills_demonstrated: list[str]
    suggested_next_project: str
