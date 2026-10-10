"""Password reset works on its own (no verification needed), never claims a
link is on its way when email is not working, and explains bad links."""
import re
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import update

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.email import EmailToken, EmailTokenPurpose
from app.services import email_service

pytestmark = pytest.mark.asyncio

PASSWORD = "SecurePass123!"


def _token(text):
    return re.search(r"[?&]token=([^\s&]+)", text).group(1)


@pytest.fixture
def outbox(monkeypatch):
    sent = []

    async def accept(message):
        sent.append(message)
        return email_service.EmailResult(True, "accepted", provider_id="id")

    monkeypatch.setattr(email_service, "send_email", accept)
    return sent


async def _register(client, email):
    r = await client.post("/api/v1/auth/register", json={"email": email, "password": PASSWORD, "full_name": "Reset Tester"})
    assert r.status_code == 201
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


async def test_reset_works_for_an_unverified_account_and_signs_in_with_the_new_password(client, outbox):
    headers = await _register(client, "reset1@example.com")
    assert (await client.get("/api/v1/auth/me", headers=headers)).json()["email_verified"] is False
    outbox.clear()
    resp = await client.post("/api/v1/auth/forgot-password", json={"email": "reset1@example.com"})
    assert resp.status_code == 200
    mail = outbox[0]
    assert mail.subject == "Reset your CareerFound password" and mail.to == "reset1@example.com"
    assert "/reset-password?token=" in mail.text
    done = await client.post("/api/v1/auth/reset-password", json={"token": _token(mail.text), "new_password": "BrandNewPass456!"})
    assert done.status_code == 200
    assert (await client.post("/api/v1/auth/login", json={"email": "reset1@example.com", "password": "BrandNewPass456!"})).status_code == 200
    assert (await client.post("/api/v1/auth/login", json={"email": "reset1@example.com", "password": PASSWORD})).status_code == 401
    # resetting a password does not verify the email
    assert (await client.get("/api/v1/auth/me", headers=headers)).json()["email_verified"] is False


async def test_the_confirmation_never_promises_delivery(client, outbox):
    await _register(client, "wording2@example.com")
    body = (await client.post("/api/v1/auth/forgot-password", json={"email": "wording2@example.com"})).json()
    text = body["message"].lower()
    assert "asked our email service" in text and "spam" in text
    assert "on its way" not in text and "has been sent" not in text and "delivered" not in text


async def test_production_without_email_says_so_for_every_address(client, outbox, monkeypatch):
    await _register(client, "prod3@example.com")
    outbox.clear()
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "console")
    for address in ("prod3@example.com", "nobody-here@example.com"):
        resp = await client.post("/api/v1/auth/forgot-password", json={"email": address})
        assert resp.status_code == 503, address
        err = resp.json()["error"]
        assert err["code"] == "email_not_configured" and "unchanged" in err["message"]
        assert "on its way" not in err["message"].lower()
    assert outbox == []


async def test_a_setup_failure_is_reported_but_a_passing_outage_stays_neutral(client, monkeypatch):
    await _register(client, "setup4@example.com")

    async def domain_unverified(message):
        return email_service.EmailResult(False, "sender_domain_unverified")

    monkeypatch.setattr(email_service, "send_email", domain_unverified)
    known = await client.post("/api/v1/auth/forgot-password", json={"email": "setup4@example.com"})
    assert known.status_code == 503 and known.json()["error"]["code"] == "email_not_configured"

    async def outage(message):
        return email_service.EmailResult(False, "provider_unavailable")

    monkeypatch.setattr(email_service, "send_email", outage)
    known = await client.post("/api/v1/auth/forgot-password", json={"email": "setup4@example.com"})
    unknown = await client.post("/api/v1/auth/forgot-password", json={"email": "ghost4@example.com"})
    assert known.status_code == unknown.status_code == 200 and known.json() == unknown.json()


async def test_unknown_address_gets_the_same_answer_and_no_email(client, outbox):
    known = await _register(client, "known5@example.com")
    outbox.clear()
    a = await client.post("/api/v1/auth/forgot-password", json={"email": "known5@example.com"})
    b = await client.post("/api/v1/auth/forgot-password", json={"email": "ghost5@example.com"})
    assert a.status_code == b.status_code == 200 and a.json() == b.json()
    assert [m.to for m in outbox] == ["known5@example.com"]


async def test_one_address_cannot_be_flooded(client, outbox):
    await _register(client, "flood6@example.com")
    codes = [(await client.post("/api/v1/auth/forgot-password", json={"email": "flood6@example.com"})).status_code for _ in range(5)]
    assert codes[:3] == [200, 200, 200] and codes[3] == 429


async def test_reset_link_problems_are_explained_with_codes(client, outbox):
    await _register(client, "links7@example.com")
    outbox.clear()
    await client.post("/api/v1/auth/forgot-password", json={"email": "links7@example.com"})
    link = _token(outbox[0].text)

    bad = await client.post("/api/v1/auth/reset-password", json={"token": "x" * 40, "new_password": "Whatever456!"})
    assert bad.status_code == 400 and bad.json()["error"]["code"] == "link_invalid"

    async with AsyncSessionLocal() as db:
        await db.execute(update(EmailToken).where(EmailToken.purpose == EmailTokenPurpose.password_reset).values(expires_at=datetime.now(timezone.utc) - timedelta(minutes=1)))
        await db.commit()
    expired = await client.post("/api/v1/auth/reset-password", json={"token": link, "new_password": "Whatever456!"})
    assert expired.status_code == 400 and expired.json()["error"]["code"] == "link_expired"
    assert "request a new one" in expired.json()["error"]["message"].lower()

    async with AsyncSessionLocal() as db:
        await db.execute(update(EmailToken).values(expires_at=datetime.now(timezone.utc) + timedelta(hours=1)))
        await db.commit()
    assert (await client.post("/api/v1/auth/reset-password", json={"token": link, "new_password": "FirstNew456!"})).status_code == 200
    used = await client.post("/api/v1/auth/reset-password", json={"token": link, "new_password": "SecondNew456!"})
    assert used.status_code == 400 and used.json()["error"]["code"] == "link_used"


async def test_a_newer_reset_link_replaces_the_older_one(client, outbox):
    await _register(client, "replaced8@example.com")
    outbox.clear()
    await client.post("/api/v1/auth/forgot-password", json={"email": "replaced8@example.com"})
    first = _token(outbox[0].text)
    await client.post("/api/v1/auth/forgot-password", json={"email": "replaced8@example.com"})
    second = _token(outbox[1].text)
    assert (await client.post("/api/v1/auth/reset-password", json={"token": first, "new_password": "Whatever456!"})).json()["error"]["code"] == "link_used"
    assert (await client.post("/api/v1/auth/reset-password", json={"token": second, "new_password": "Whatever456!"})).status_code == 200


async def test_reset_link_uses_the_public_site(client, outbox, monkeypatch):
    monkeypatch.setattr(settings, "PUBLIC_APP_URL", "https://www.mycareerfound.com")
    await _register(client, "url9@example.com")
    outbox.clear()
    await client.post("/api/v1/auth/forgot-password", json={"email": "url9@example.com"})
    assert "https://www.mycareerfound.com/reset-password?token=" in outbox[0].text
