from pydantic import BaseModel, Field


class MilestoneUpdate(BaseModel):
    done: bool


class ChecklistUpdate(BaseModel):
    items: dict[str, bool] = Field(default_factory=dict, max_length=60)


class RepositoryUpdate(BaseModel):
    url: str = Field(max_length=300)


class InterviewUpdate(BaseModel):
    answers: dict[str, str] = Field(default_factory=dict, max_length=40)


class ReviewSubmission(BaseModel):
    note: str = Field(default="", max_length=1000)


class ReviewDecision(BaseModel):
    decision: str = Field(max_length=20)
    note: str = Field(max_length=2000)
    opened_repository: bool = False
