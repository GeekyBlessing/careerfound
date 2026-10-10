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


class VerificationStatusOut(BaseModel):
    """What the verification screen needs to render truthfully on load."""

    email_verified: bool
    masked_email: str
    resend_available_in: int
    email_configured: bool


class VerificationSentOut(BaseModel):
    """Result of asking for a verification email. `accepted` means the
    email provider took the message, not that it reached an inbox."""

    message: str
    masked_email: str
    accepted: bool
    resend_available_in: int


class ChangeEmailRequest(BaseModel):
    new_email: EmailStr
    password: str = Field(min_length=1, max_length=128)


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
