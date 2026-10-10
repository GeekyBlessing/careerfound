"""The email verification flow end to end: what the provider answered, what
the person is told, and what state their links are left in.

The provider tests run a real HTTP server standing in for Resend (not a
mock of our own function), so the request we build, the headers we send
and the way we read the answer are all exercised on the wire."""
import json
import re
import threading
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest
from sqlalchemy import select, update

from app.core.config import Settings, settings
from app.db.session import AsyncSessionLocal
from app.models.email import EmailToken
from app.models.user import User
from app.services import email_service

pytestmark = pytest.mark.asyncio

PASSWORD = "SecurePass123!"


def _token(text: str) -> str:
    match = re.search(r"[?&]token=([^\s&]+)", text)
    assert match, text
    return match.group(1)


async def _register(client, email="flow@example.com"):
    resp = await client.post("/api/v1/auth/register", json={"email": email, "password": PASSWORD, "full_name": "Flow Tester"})
    assert resp.status_code == 201, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


async def _age_tokens(minutes: int = 10):
    async with AsyncSessionLocal() as db:
        await db.execute(update(EmailToken).values(created_at=datetime.now(timezone.utc) - timedelta(minutes=minutes)))
        await db.commit()


@pytest.fixture
def outbox(monkeypatch):
    sent = []

    async def accept(message):
        sent.append(message)
        return email_service.EmailResult(True, "accepted", provider_id="test-id")

    monkeypatch.setattr(email_service, "send_email", accept)
    return sent


def _fail_with(monkeypatch, status):
    async def refuse(message):
        return email_service.EmailResult(False, status, detail="test")

    monkeypatch.setattr(email_service, "send_email", refuse)


# --- A stand-in for Resend, over real HTTP -----------------------------------


class _FakeResend:
    def __init__(self):
        self.requests = []
        self.reply = (200, {"id": "re_test_123"})
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):  # noqa: N802
                body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
                outer.requests.append({"headers": dict(self.headers), "json": json.loads(body)})
                code, payload = outer.reply
                data = json.dumps(payload).encode()
                self.send_response(code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def log_message(self, *a):
                pass

        self.server = HTTPServer(("127.0.0.1", 0), Handler)
        self.url = f"http://127.0.0.1:{self.server.server_port}/emails"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def close(self):
        self.server.shutdown()


@pytest.fixture
def fake_resend(monkeypatch):
    server = _FakeResend()
    monkeypatch.setattr(email_service, "RESEND_API_URL", server.url)
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "resend")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key")
    yield server
    server.close()


def _message():
    return email_service.EmailMessage(to="person@example.com", subject="S", html="<p>x</p>", text="x")


async def test_provider_acceptance_is_reported_with_the_providers_id(fake_resend):
    result = await email_service.send_email(_message())
    assert result.ok and result.status == "accepted" and result.provider_id == "re_test_123"
    sent = fake_resend.requests[0]
    assert sent["headers"]["Authorization"] == "Bearer re_test_key"
    assert sent["json"]["from"] == f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
    assert sent["json"]["reply_to"] == settings.EMAIL_REPLY_TO


@pytest.mark.parametrize(
    "code,body,expected",
    [
        (403, {"name": "validation_error", "message": "The mycareerfound.com domain is not verified. Please, add and verify your domain."}, "sender_domain_unverified"),
        (401, {"name": "missing_api_key", "message": "Missing API key"}, "invalid_api_key"),
        (403, {"name": "invalid_api_key", "message": "API key is invalid"}, "invalid_api_key"),
        (403, {"name": "validation_error", "message": "You can only send testing emails to your own email address"}, "recipient_restricted"),
        (429, {"name": "rate_limit_exceeded", "message": "Too many requests"}, "rate_limited"),
        (422, {"name": "validation_error", "message": "Invalid `to` field"}, "address_rejected"),
        (500, {"name": "application_error", "message": "boom"}, "provider_unavailable"),
    ],
)
async def test_each_provider_failure_gets_its_own_reason(fake_resend, code, body, expected):
    fake_resend.reply = (code, body)
    result = await email_service.send_email(_message())
    assert not result.ok
    assert result.status == expected


async def test_network_failure_is_reported_as_such(monkeypatch):
    monkeypatch.setattr(email_service, "RESEND_API_URL", "http://127.0.0.1:1/emails")
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "resend")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key")
    result = await email_service.send_email(_message())
    assert not result.ok and result.status == "network_error"


async def test_unverified_sender_domain_is_explained_without_blaming_the_person(client, fake_resend):
    fake_resend.reply = (403, {"name": "validation_error", "message": "The mycareerfound.com domain is not verified."})
    headers = await _register(client, "domain@example.com")
    await _age_tokens()
    resp = await client.post("/api/v1/auth/resend-verification", headers=headers)
    assert resp.status_code == 503
    err = resp.json()["error"]
    assert err["code"] == "email_not_configured" and err["setup_problem"] is True
    assert "your address is fine" in err["message"].lower()
    assert err["masked_email"].startswith("d") and err["masked_email"].endswith("@example.com")
    assert "domain@example.com" not in resp.text
    assert "has been sent" not in err["message"].lower() and "we sent" not in err["message"].lower()


async def test_outage_says_try_again_and_keeps_retry_open(client, fake_resend):
    fake_resend.reply = (500, {"message": "down"})
    headers = await _register(client, "outage@example.com")
    await _age_tokens()
    first = await client.post("/api/v1/auth/resend-verification", headers=headers)
    assert first.status_code == 503 and first.json()["error"]["code"] == "email_temporarily_unavailable"
    # A failed attempt must not start a cooldown the person did nothing to earn.
    fake_resend.reply = (200, {"id": "re_ok"})
    second = await client.post("/api/v1/auth/resend-verification", headers=headers)
    assert second.status_code == 200 and second.json()["accepted"] is True


# --- Resend, cooldown and link state ----------------------------------------


async def test_resend_response_claims_a_request_not_delivery(client, outbox):
    headers = await _register(client, "wording@example.com")
    await _age_tokens()
    resp = await client.post("/api/v1/auth/resend-verification", headers=headers)
    body = resp.json()
    assert resp.status_code == 200 and body["accepted"] is True
    assert "asked our email service" in body["message"]
    assert "delivered" not in body["message"].lower()
    assert body["resend_available_in"] == 60
    assert "wording@example.com" not in resp.text


async def test_second_resend_inside_the_cooldown_is_refused_with_a_countdown(client, outbox):
    headers = await _register(client, "cooldown@example.com")
    await _age_tokens()
    assert (await client.post("/api/v1/auth/resend-verification", headers=headers)).status_code == 200
    again = await client.post("/api/v1/auth/resend-verification", headers=headers)
    assert again.status_code == 429
    err = again.json()["error"]
    assert err["code"] == "resend_cooldown" and 1 <= err["retry_after"] <= 60
    assert again.headers["Retry-After"] == str(err["retry_after"])


async def test_registration_itself_starts_the_cooldown(client, outbox):
    headers = await _register(client, "justjoined@example.com")
    resp = await client.post("/api/v1/auth/resend-verification", headers=headers)
    assert resp.status_code == 429


async def test_verification_status_is_masked_and_reports_the_cooldown(client, outbox):
    headers = await _register(client, "statusme@example.com")
    resp = await client.get("/api/v1/auth/verification-status", headers=headers)
    body = resp.json()
    assert body["email_verified"] is False
    assert body["masked_email"] == "s******@example.com"
    assert 0 < body["resend_available_in"] <= 60


async def test_a_failed_resend_leaves_the_earlier_link_working(client, outbox, monkeypatch):
    headers = await _register(client, "keepold@example.com")
    first_link = _token(next(m for m in outbox if "Verify" in m.subject).text)
    await _age_tokens()
    _fail_with(monkeypatch, "provider_unavailable")
    assert (await client.post("/api/v1/auth/resend-verification", headers=headers)).status_code == 503
    ok = await client.post("/api/v1/auth/verify-email", json={"token": first_link})
    assert ok.status_code == 200 and ok.json()["email_verified"] is True


async def test_a_successful_resend_replaces_the_older_link_and_says_so(client, outbox):
    headers = await _register(client, "replaced@example.com")
    old_link = _token(next(m for m in outbox if "Verify" in m.subject).text)
    await _age_tokens()
    outbox.clear()
    assert (await client.post("/api/v1/auth/resend-verification", headers=headers)).status_code == 200
    new_link = _token(outbox[0].text)
    stale = await client.post("/api/v1/auth/verify-email", json={"token": old_link})
    assert stale.status_code == 400 and stale.json()["error"]["code"] == "link_replaced"
    assert (await client.post("/api/v1/auth/verify-email", json={"token": new_link})).status_code == 200


async def test_link_states_each_have_their_own_code(client, outbox):
    await _register(client, "states@example.com")
    link = _token(outbox[-1].text) if "Verify" in outbox[-1].subject else _token(next(m for m in outbox if "Verify" in m.subject).text)

    invalid = await client.post("/api/v1/auth/verify-email", json={"token": "nope" * 12})
    assert invalid.status_code == 400 and invalid.json()["error"]["code"] == "link_invalid"

    async with AsyncSessionLocal() as db:
        await db.execute(update(EmailToken).values(expires_at=datetime.now(timezone.utc) - timedelta(minutes=1)))
        await db.commit()
    expired = await client.post("/api/v1/auth/verify-email", json={"token": link})
    assert expired.status_code == 400 and expired.json()["error"]["code"] == "link_expired"
    assert "request a new one" in expired.json()["error"]["message"].lower()

    async with AsyncSessionLocal() as db:
        await db.execute(update(EmailToken).values(expires_at=datetime.now(timezone.utc) + timedelta(hours=1)))
        await db.commit()
    assert (await client.post("/api/v1/auth/verify-email", json={"token": link})).status_code == 200
    again = await client.post("/api/v1/auth/verify-email", json={"token": link})
    assert again.status_code == 409 and again.json()["error"]["code"] == "already_verified"


async def test_verified_users_get_no_resend_and_no_cooldown_state(client, outbox):
    headers = await _register(client, "done@example.com")
    link = _token(next(m for m in outbox if "Verify" in m.subject).text)
    await client.post("/api/v1/auth/verify-email", json={"token": link})
    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["email_verified"] is True
    status_resp = await client.get("/api/v1/auth/verification-status", headers=headers)
    assert status_resp.json()["email_verified"] is True and status_resp.json()["resend_available_in"] == 0
    resend = await client.post("/api/v1/auth/resend-verification", headers=headers)
    assert resend.status_code == 409 and resend.json()["error"]["code"] == "already_verified"


# --- Changing a mistyped address ---------------------------------------------


async def test_change_email_needs_the_password(client, outbox):
    headers = await _register(client, "typo@example.com")
    resp = await client.post("/api/v1/auth/change-email", headers=headers, json={"new_email": "fixed@example.com", "password": "wrong-password"})
    assert resp.status_code == 403 and resp.json()["error"]["code"] == "wrong_password"
    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["email"] == "typo@example.com"


async def test_change_email_moves_the_account_and_retires_old_links(client, outbox):
    headers = await _register(client, "typo2@example.com")
    old_link = _token(next(m for m in outbox if "Verify" in m.subject).text)
    outbox.clear()
    resp = await client.post("/api/v1/auth/change-email", headers=headers, json={"new_email": "Fixed@Example.com", "password": PASSWORD})
    assert resp.status_code == 200 and resp.json()["accepted"] is True
    assert resp.json()["masked_email"] == "f****@example.com"
    assert [m.to for m in outbox] == ["fixed@example.com"]
    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["email"] == "fixed@example.com" and me.json()["email_verified"] is False
    stale = await client.post("/api/v1/auth/verify-email", json={"token": old_link})
    assert stale.status_code == 400
    assert (await client.post("/api/v1/auth/verify-email", json={"token": _token(outbox[0].text)})).status_code == 200


async def test_change_email_reports_when_the_address_changed_but_the_email_did_not_send(client, outbox, monkeypatch):
    headers = await _register(client, "typo3@example.com")
    _fail_with(monkeypatch, "provider_unavailable")
    resp = await client.post("/api/v1/auth/change-email", headers=headers, json={"new_email": "fixed3@example.com", "password": PASSWORD})
    assert resp.status_code == 200
    body = resp.json()
    assert body["accepted"] is False and "could not send" in body["message"].lower()
    assert (await client.get("/api/v1/auth/me", headers=headers)).json()["email"] == "fixed3@example.com"


async def test_change_email_refuses_a_taken_address_and_verified_accounts(client, outbox):
    await _register(client, "owner@example.com")
    headers = await _register(client, "second@example.com")
    taken = await client.post("/api/v1/auth/change-email", headers=headers, json={"new_email": "owner@example.com", "password": PASSWORD})
    assert taken.status_code == 409 and taken.json()["error"]["code"] == "email_taken"
    link = _token([m for m in outbox if "Verify" in m.subject and m.to == "second@example.com"][0].text)
    await client.post("/api/v1/auth/verify-email", json={"token": link})
    verified = await client.post("/api/v1/auth/change-email", headers=headers, json={"new_email": "new@example.com", "password": PASSWORD})
    assert verified.status_code == 409 and verified.json()["error"]["code"] == "already_verified"


# --- Links and configuration -------------------------------------------------


async def test_verification_link_points_at_the_public_site(client, outbox, monkeypatch):
    monkeypatch.setattr(settings, "PUBLIC_APP_URL", "https://www.mycareerfound.com")
    await _register(client, "links@example.com")
    verify = next(m for m in outbox if "Verify" in m.subject)
    assert "https://www.mycareerfound.com/verify-email?token=" in verify.text
    assert "localhost" not in verify.html


async def test_production_does_not_send_localhost_links():
    s = Settings(ENVIRONMENT="production", JWT_SECRET_KEY="x" * 40, FRONTEND_ORIGIN="https://www.mycareerfound.com,https://mycareerfound.com", PUBLIC_APP_URL="http://localhost:3000")
    assert s.PUBLIC_APP_URL == "https://www.mycareerfound.com"
    explicit = Settings(ENVIRONMENT="production", JWT_SECRET_KEY="x" * 40, PUBLIC_APP_URL="https://app.example.org/")
    assert explicit.PUBLIC_APP_URL == "https://app.example.org"


async def test_readiness_problems_name_what_to_fix():
    broken = Settings(ENVIRONMENT="production", JWT_SECRET_KEY="x" * 40, EMAIL_PROVIDER="console")
    text = " ".join(broken.readiness_problems())
    assert "RESEND_API_KEY" in text and "PUBLIC_APP_URL" in text
    healthy = Settings(
        ENVIRONMENT="production", JWT_SECRET_KEY="x" * 40, EMAIL_PROVIDER="resend", RESEND_API_KEY="re_x",
        PUBLIC_APP_URL="https://www.mycareerfound.com", EMAIL_FROM_ADDRESS="no-reply@mycareerfound.com",
    )
    assert healthy.readiness_problems() == []
    assert Settings(ENVIRONMENT="development").readiness_problems() == []


async def test_mask_email():
    assert email_service.mask_email("john.doe@gmail.com") == "j******@gmail.com"
    assert email_service.mask_email("ab@x.co") == "a**@x.co"
    assert email_service.mask_email("not-an-email") == "***"
