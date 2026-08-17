import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CommunityOut(BaseModel):
    id: uuid.UUID
    path_slug: str
    name: str
    description: str

    model_config = {"from_attributes": True}


class CreatePostRequest(BaseModel):
    kind: str = "discussion"
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=10000)


class PostOut(BaseModel):
    id: uuid.UUID
    author_name: str
    kind: str
    title: str
    body: str
    upvotes: int
    created_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardEntryOut(BaseModel):
    rank: int
    user_name: str
    xp: int
