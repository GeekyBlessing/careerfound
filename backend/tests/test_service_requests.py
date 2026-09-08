import pytest
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.service_request import ServiceRequest, ServiceRequestType
from app.services import email_service

pytestmark = pytest.mark.asyncio


@pytest.fixture
def email_spy(monkeypatch):
    """Same pattern as tests/test_email.py: replace the send_email() choke
    point with a spy so tests never hit the network and can assert exactly
    what would have gone out."""
    sent = []

    async def fake_send_email(message):
        sent.append(message)
        return True

    monkeypatch.setattr(email_service, "send_email", fake_send_email)
    return sent


async def test_create_service_request_stores_row_and_sends_two_emails(client, email_spy):
    resp = await client.post(
        "/api/v1/service-requests",
        json={
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "service": "mentorship",
            "message": "I want to move into backend engineering.",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["service"] == "mentorship"

    async with AsyncSessionLocal() as db:
        row = (await db.execute(select(ServiceRequest))).scalar_one()
        assert row.name == "Ada Lovelace"
        assert row.email == "ada@example.com"
        assert row.service == ServiceRequestType.mentorship
        assert "backend engineering" in row.message

    # One confirmation to the requester, one internal notification.
    assert len(email_spy) == 2
    to_addresses = [m.to for m in email_spy]
    assert "ada@example.com" in to_addresses
    subjects = [m.subject for m in email_spy]
    assert any("received your" in s for s in subjects)
    assert any("New " in s and "request" in s for s in subjects)


async def test_create_service_request_does_not_require_auth(client, email_spy):
    resp = await client.post(
        "/api/v1/service-requests",
        json={"name": "Grace Hopper", "email": "grace@example.com", "service": "consultation", "message": ""},
    )
    assert resp.status_code == 201


async def test_create_service_request_rejects_invalid_email(client, email_spy):
    resp = await client.post(
        "/api/v1/service-requests",
        json={"name": "No Email", "email": "not-an-email", "service": "consultation", "message": ""},
    )
    assert resp.status_code == 422


async def test_create_service_request_rejects_missing_service(client, email_spy):
    resp = await client.post(
        "/api/v1/service-requests",
        json={"name": "No Service", "email": "x@example.com", "service": "premium", "message": ""},
    )
    assert resp.status_code == 422


async def test_service_request_confirmation_does_not_claim_payment_taken(client, email_spy):
    await client.post(
        "/api/v1/service-requests",
        json={"name": "Ada Lovelace", "email": "ada2@example.com", "service": "consultation", "message": ""},
    )
    confirmation = next(m for m in email_spy if m.to == "ada2@example.com")
    assert "not a payment confirmation" in confirmation.html.lower()
