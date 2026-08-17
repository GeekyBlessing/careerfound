"""
Structured output contracts for every AI feature.

Every provider (mock or real) must return data that validates against these
Pydantic models. This is what makes a provider swap safe: if a real model's
response doesn't fit the contract, it fails loudly in the service layer
instead of silently shipping malformed content to the frontend.
"""
from pydantic import BaseModel, Field


class SkillTransfer(BaseModel):
    skill: str
    why_it_transfers: str


class CareerRecommendation(BaseModel):
    path_slug: str
    tier: str  # "best_match" | "strong_alternative" | "wild_card"
    fit_score: int = Field(ge=0, le=100)
    why_it_fits: str
    transferable_skills: list[SkillTransfer]
    skills_to_develop: list[str]
    difficulty_label: str
    timeline_label: str
    entry_roles: list[str]
    example_projects: list[str]
    tools: list[str]
    earning_notes: str
    remote_potential_label: str
    recommended_next_step: str


class CareerDNA(BaseModel):
    """Radar-chart-friendly strengths profile, 0-100 per axis."""

    problem_solving: int = Field(ge=0, le=100)
    mathematics: int = Field(ge=0, le=100)
    creativity: int = Field(ge=0, le=100)
    people_orientation: int = Field(ge=0, le=100)
    systems_thinking: int = Field(ge=0, le=100)
    communication: int = Field(ge=0, le=100)
    summary: str


class AssessmentResult(BaseModel):
    career_dna: CareerDNA
    recommendations: list[CareerRecommendation]


class MentorReply(BaseModel):
    message: str
    detected_struggle: str | None = None
    suggested_roadmap_adjustment: str | None = None
    follow_up_questions: list[str] = Field(default_factory=list)


class ProjectReviewFinding(BaseModel):
    severity: str  # "must_fix" | "should_fix" | "nice_to_have" | "praise"
    comment: str


class ProjectReview(BaseModel):
    overall_assessment: str
    findings: list[ProjectReviewFinding]
    skills_demonstrated: list[str]
    suggested_next_project: str


class PortfolioCopy(BaseModel):
    project_description: str
    readme_draft: str
    cv_bullet: str
    linkedin_blurb: str
    case_study_md: str
    skills_demonstrated: list[str]
