import uuid

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class EmailPreferencesUpdate(BaseModel):
    marketing_opt_in: bool


class MessageResponse(BaseModel):
    message: str


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    country: str | None = None
    timezone: str | None = None
    persona: str | None = None
    goal: str | None = None
    device_access: str | None = None
    time_budget_minutes_per_day: int | None = None
    beginner_mode: bool
    plan: str
    role: str
    email_verified: bool = False
    marketing_opt_in: bool = False

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    country: str | None = None
    timezone: str | None = None
    persona: str | None = None
    goal: str | None = None
    device_access: str | None = None
    time_budget_minutes_per_day: int | None = None
