from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.service_request import ServiceRequest
from app.schemas.service_request import ServiceRequestIn, ServiceRequestOut
from app.services import email_service

router = APIRouter(prefix="/service-requests", tags=["service-requests"])


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else ""


@router.post("", response_model=ServiceRequestOut, status_code=201)
async def create_service_request(payload: ServiceRequestIn, http_request: Request, db: AsyncSession = Depends(get_db)):
    """Public lead-capture for CareerFound's two paid personal offerings
    (1:1 Career Mentorship and Career Consultation). No auth required, this
    is deliberately reachable by anonymous visitors from the pricing page,
    so it's rate-limited by IP the same way the other unauthenticated,
    email-triggering auth endpoints are, to stop it being used to spam the
    requester's inbox or flood the team inbox.
    No payment is taken here, there is no payment processor connected yet,
    this stores the request and emails both the requester (confirmation)
    and the team inbox (so the lead is actually seen and followed up on).
    """
    limiter.check(f"service-request:{_client_ip(http_request)}", settings.EMAIL_RATE_LIMIT_PER_MINUTE)
    request = ServiceRequest(
        name=payload.name.strip(),
        email=str(payload.email),
        service=payload.service,
        message=payload.message.strip(),
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)

    await email_service.send_service_request_confirmation(name=request.name, email=request.email, service=request.service.value)
    await email_service.send_service_request_notification(
        name=request.name, email=request.email, service=request.service.value, message=request.message
    )

    return request
