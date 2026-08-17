import uuid

from pydantic import BaseModel


class GeneratePortfolioRequest(BaseModel):
    project_id: uuid.UUID
    submission_text: str = ""


class PortfolioItemOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    project_description: str
    readme_draft: str
    cv_bullet: str
    linkedin_blurb: str
    case_study_md: str
    skills_demonstrated: list[str]
    is_published: bool

    model_config = {"from_attributes": True}


class PortfolioItemUpdateRequest(BaseModel):
    project_description: str | None = None
    readme_draft: str | None = None
    cv_bullet: str | None = None
    linkedin_blurb: str | None = None
    case_study_md: str | None = None
    is_published: bool | None = None
