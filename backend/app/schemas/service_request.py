import uuid

from pydantic import BaseModel, EmailStr, Field

from app.models.service_request import ServiceRequestType


class ServiceRequestIn(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    service: ServiceRequestType
    message: str = Field(default="", max_length=2000)


class ServiceRequestOut(BaseModel):
    id: uuid.UUID
    service: ServiceRequestType
    # False when the notification or confirmation email could not be sent.
    team_notified: bool = False
    confirmation_sent: bool = False

    model_config = {"from_attributes": True}
