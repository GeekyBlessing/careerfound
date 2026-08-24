import re
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import select, update

from app.core.security import hash_token
from app.db.session import AsyncSessionLocal
from app.models.email import EmailToken, EmailTokenPurpose
from app.models.user import User
from app.services import email_service

pytestmark = pytest.mark.asyncio


def _extract_token(sent_text: str) -> str:
    match = re.search(r"[?&]token=([^\s&]+)", sent_text)
    assert match, f"no token found in email body: {sent_text!r}"
    return match.group(1)


@pytest.fixture
def email_spy(monkeypatch):
    """Replaces the single send_email() choke point with a spy so tests
    never hit the network and can assert exactly what would have gone
    out, in console mode (the test default) send_email would otherwise
    just log, this captures the actual EmailMessage objects instead."""
    sent = []

    async def fake_send_email(message):
        sent.append(message)
        return True

    monkeypatch.setattr(email_service, "send_email", fake_send_email)
    return sent


async def test_register_triggers_welcome_and_verification_email(client, email_spy):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "SecurePass123!", "full_name": "New User"},
    )
    assert resp.status_code == 201
    assert len(email_spy) == 2

    subjects = [m.subject for m in email_spy]
    assert any("Welcome to CareerFound" in s for s in subjects)
    assert any("Verify your email" in s for s in subjects)
    assert all(m.to == "newuser@example.com" for m in email_spy)


async def test_registration_succeeds_even_if_email_sending_raises(client, monkeypatch):
    async def broken_send(message):
        raise RuntimeError("provider is down")

    monkeypatch.setattr(email_service, "send_email", broken_send)

    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "resilient@example.com", "password": "SecurePass123!", "full_name": "Resilient User"},
    )
    # A broken email provider must never break account creation.
    assert resp.status_code == 201
    assert "access_token" in resp.json()


async def test_new_user_starts_unverified(client, email_spy):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "unverified@example.com", "password": "SecurePass123!", "full_name": "U"},
    )
    token = resp.json()["access_token"]
    me = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["email_verified"] is False


async def test_verify_email_with_valid_token_marks_account_verified(client, email_spy):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "verifyme@example.com", "password": "SecurePass123!", "full_name": "V"},
    )
    access_token = resp.json()["access_token"]

    verification_email = next(m for m in email_spy if "Verify your email" in m.subject)
    raw_token = _extract_token(verification_email.text)

    verify_resp = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert verify_resp.status_code == 200
    assert verify_resp.json()["email_verified"] is True

    me = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me.json()["email_verified"] is True


async def test_verify_email_rejects_garbage_token(client):
    resp = await client.post("/api/v1/auth/verify-email", json={"token": "not-a-real-token"})
    assert resp.status_code == 400


async def test_verify_email_rejects_reused_token(client, email_spy):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "reuse@example.com", "password": "SecurePass123!", "full_name": "R"},
    )
    verification_email = next(m for m in email_spy if "Verify your email" in m.subject)
    raw_token = _extract_token(verification_email.text)

    first = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert first.status_code == 200
    second = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert second.status_code == 400


async def test_verify_email_rejects_expired_token(client, email_spy):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "expired@example.com", "password": "SecurePass123!", "full_name": "E"},
    )
    verification_email = next(m for m in email_spy if "Verify your email" in m.subject)
    raw_token = _extract_token(verification_email.text)

    async with AsyncSessionLocal() as db:
        await db.execute(
            update(EmailToken)
            .where(EmailToken.token_hash == hash_token(raw_token))
            .values(expires_at=datetime.now(timezone.utc) - timedelta(hours=1))
        )
        await db.commit()

    verify_resp = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert verify_resp.status_code == 400


async def test_resend_verification_requires_auth(client):
    resp = await client.post("/api/v1/auth/resend-verification")
    assert resp.status_code == 401


async def test_resend_verification_sends_new_token(client, email_spy):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "resend@example.com", "password": "SecurePass123!", "full_name": "R"},
    )
    access_token = resp.json()["access_token"]
    email_spy.clear()

    resend_resp = await client.post(
        "/api/v1/auth/resend-verification", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert resend_resp.status_code == 200
    assert len(email_spy) == 1
    assert "Verify your email" in email_spy[0].subject


async def test_resend_verification_rejected_once_already_verified(client, email_spy):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "alreadyverified@example.com", "password": "SecurePass123!", "full_name": "A"},
    )
    access_token = resp.json()["access_token"]
    verification_email = next(m for m in email_spy if "Verify your email" in m.subject)
    raw_token = _extract_token(verification_email.text)
    await client.post("/api/v1/auth/verify-email", json={"token": raw_token})

    resend_resp = await client.post(
        "/api/v1/auth/resend-verification", headers={"Authorization": f"Bearer {access_token}"}
    )
    assert resend_resp.status_code == 409


async def test_forgot_password_same_response_for_existing_and_unknown_email(client, email_spy):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "hasaccount@example.com", "password": "SecurePass123!", "full_name": "H"},
    )
    email_spy.clear()

    resp_known = await client.post("/api/v1/auth/forgot-password", json={"email": "hasaccount@example.com"})
    resp_unknown = await client.post("/api/v1/auth/forgot-password", json={"email": "nobody@example.com"})

    assert resp_known.status_code == 200
    assert resp_unknown.status_code == 200
    assert resp_known.json()["message"] == resp_unknown.json()["message"]

    # Only the real account actually generated an email, no enumeration
    # signal, but also no email wasted on an address nobody owns.
    assert len(email_spy) == 1
    assert email_spy[0].to == "hasaccount@example.com"
    assert "Reset your" in email_spy[0].subject


async def test_reset_password_with_valid_token_changes_password(client, email_spy):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "resetme@example.com", "password": "OldPass123!", "full_name": "R"},
    )
    email_spy.clear()
    await client.post("/api/v1/auth/forgot-password", json={"email": "resetme@example.com"})
    reset_email = email_spy[0]
    raw_token = _extract_token(reset_email.text)

    reset_resp = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": "BrandNewPass456!"}
    )
    assert reset_resp.status_code == 200

    old_login = await client.post("/api/v1/auth/login", json={"email": "resetme@example.com", "password": "OldPass123!"})
    assert old_login.status_code == 401

    new_login = await client.post("/api/v1/auth/login", json={"email": "resetme@example.com", "password": "BrandNewPass456!"})
    assert new_login.status_code == 200


async def test_reset_password_token_cannot_be_reused(client, email_spy):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "onetimereset@example.com", "password": "OldPass123!", "full_name": "R"},
    )
    email_spy.clear()
    await client.post("/api/v1/auth/forgot-password", json={"email": "onetimereset@example.com"})
    raw_token = _extract_token(email_spy[0].text)

    first = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": "FirstNewPass456!"}
    )
    assert first.status_code == 200

    second = await client.post(
        "/api/v1/auth/reset-password", json={"token": raw_token, "new_password": "SecondNewPass789!"}
    )
    assert second.status_code == 400


async def test_reset_password_rejects_invalid_token(client):
    resp = await client.post(
        "/api/v1/auth/reset-password", json={"token": "bogus", "new_password": "WhateverPass456!"}
    )
    assert resp.status_code == 400


async def test_password_reset_never_sent_by_email_in_body(client, email_spy):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "nopasswordleak@example.com", "password": "SuperSecret123!", "full_name": "N"},
    )
    email_spy.clear()
    await client.post("/api/v1/auth/forgot-password", json={"email": "nopasswordleak@example.com"})
    reset_email = email_spy[0]
    assert "SuperSecret123!" not in reset_email.html
    assert "SuperSecret123!" not in reset_email.text


async def test_register_rejects_invalid_email_format(client):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "SecurePass123!", "full_name": "Bad Email"},
    )
    assert resp.status_code == 422


async def test_forgot_password_rate_limited(client, email_spy, monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "EMAIL_RATE_LIMIT_PER_MINUTE", 3)
    for _ in range(3):
        resp = await client.post("/api/v1/auth/forgot-password", json={"email": "ratelimit@example.com"})
        assert resp.status_code == 200
    blocked = await client.post("/api/v1/auth/forgot-password", json={"email": "ratelimit@example.com"})
    assert blocked.status_code == 429


async def test_email_preferences_default_off_and_can_be_updated(client, email_spy):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "prefs@example.com", "password": "SecurePass123!", "full_name": "P"},
    )
    access_token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}

    me = await client.get("/api/v1/users/me", headers=headers)
    assert me.json()["marketing_opt_in"] is False

    updated = await client.patch("/api/v1/users/me/email-preferences", json={"marketing_opt_in": True}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["marketing_opt_in"] is True


async def test_product_email_not_sent_without_opt_in(client, email_spy):
    async with AsyncSessionLocal() as db:
        user = User(email="noopt@example.com", full_name="No Opt", password_hash="x")
        db.add(user)
        await db.commit()
        await db.refresh(user)

    sent = await email_service.send_product_email(
        user, subject="New roadmap tip", heading="A tip for you", body_html="<p>Hi</p>"
    )
    assert sent is False
    assert len(email_spy) == 0


async def test_product_email_sent_after_opt_in(client, email_spy):
    async with AsyncSessionLocal() as db:
        user = User(email="optedin@example.com", full_name="Opted In", password_hash="x", marketing_opt_in=True)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    sent = await email_service.send_product_email(
        user, subject="New roadmap tip", heading="A tip for you", body_html="<p>Hi</p>"
    )
    assert sent is True
    assert len(email_spy) == 1
    assert email_spy[0].category == "product"


async def test_email_links_use_configured_public_app_url(client, email_spy):
    from app.core.config import settings

    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "linkcheck@example.com", "password": "SecurePass123!", "full_name": "L"},
    )
    assert resp.status_code == 201
    verification_email = next(m for m in email_spy if "Verify your email" in m.subject)
    assert settings.PUBLIC_APP_URL in verification_email.text
    assert "/verify-email?token=" in verification_email.text


async def test_resend_provider_uses_configured_sender_address(monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "resend")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "test-key-123")
    monkeypatch.setattr(settings, "EMAIL_FROM_NAME", "CareerFound")
    monkeypatch.setattr(settings, "EMAIL_FROM_ADDRESS", "no-reply@mycareerfound.com")

    captured = {}

    class FakeResponse:
        status_code = 200
        text = "{}"

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, url, json, headers):
            captured["url"] = url
            captured["json"] = json
            captured["headers"] = headers
            return FakeResponse()

    import httpx

    monkeypatch.setattr(httpx, "AsyncClient", FakeAsyncClient)

    message = email_service.EmailMessage(
        to="someone@example.com", subject="Test", html="<p>hi</p>", text="hi"
    )
    ok = await email_service.send_email(message)

    assert ok is True
    assert captured["json"]["from"] == "CareerFound <no-reply@mycareerfound.com>"
    assert captured["json"]["to"] == ["someone@example.com"]
    assert captured["headers"]["Authorization"] == "Bearer test-key-123"


async def test_resend_provider_without_api_key_fails_closed(monkeypatch):
    from app.core.config import settings

    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "resend")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")

    message = email_service.EmailMessage(to="x@example.com", subject="Test", html="<p>hi</p>", text="hi")
    ok = await email_service.send_email(message)
    assert ok is False
