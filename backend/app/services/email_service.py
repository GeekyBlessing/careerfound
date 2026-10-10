"""
Transactional email: one provider-agnostic `send_email()` choke point, a
shared branded HTML template, and typed senders for each email CareerFound
sends today (welcome, verification, password reset).

- ConsoleProvider (default, EMAIL_PROVIDER=console): logs the rendered
  email instead of making a network call, so registration/password-reset
  flows work with zero setup in local dev and in the test suite. This is
  NOT a production mode, see settings.email_live.
- ResendProvider (EMAIL_PROVIDER=resend + RESEND_API_KEY): sends real email
  via Resend's HTTP API. No other file in the codebase needs to change to
  go live, mirrors the LLM_PROVIDER mock/live pattern in app/ai/providers.py.

Every sender here is best-effort: a failed send is logged and swallowed,
never raised, so a flaky email provider can never break registration,
login, or a password-reset request. Callers that need to know whether a
send actually happened use the boolean `send_email()` returns.

Category discipline (product requirement, not just style): welcome,
verification, password reset, and any future booking/payment confirmation
are transactional and always send. Anything promotional (career tips,
roadmap nudges, project reminders) must go through `send_product_email`,
which checks `user.marketing_opt_in` and silently no-ops when the user
hasn't opted in. Nothing in this file ever sends a marketing email without
that explicit check.
"""
from __future__ import annotations

import html as _html
import logging
from dataclasses import dataclass
from typing import Literal
from urllib.parse import quote

import httpx

from app.core.config import settings
from app.models.user import User

logger = logging.getLogger("careerfound.email")

RESEND_API_URL = "https://api.resend.com/emails"

EmailCategory = Literal["transactional", "product"]


@dataclass
class EmailMessage:
    to: str
    subject: str
    html: str
    text: str
    category: EmailCategory = "transactional"


# What happened to one send attempt. `ok` means the provider ACCEPTED the
# message for delivery (or, in console mode outside production, that it was
# logged). It never means "reached an inbox": delivery after acceptance is
# the provider's and the recipient's mail server's business, so callers must
# word user-facing copy as "requested", not "delivered".
#
# `status` is a stable machine-readable reason a send failed, so the app
# can tell the person something true and the operator can see the real
# cause in the logs instead of one generic "could not send".
SetupProblem = ("not_configured", "invalid_api_key", "sender_domain_unverified", "recipient_restricted")


@dataclass(frozen=True)
class EmailResult:
    ok: bool
    status: str  # accepted | not_configured | invalid_api_key | sender_domain_unverified | recipient_restricted | address_rejected | rate_limited | provider_unavailable | network_error | rejected
    provider_id: str | None = None
    detail: str = ""

    def __bool__(self) -> bool:
        return self.ok

    @property
    def is_setup_problem(self) -> bool:
        """True when the failure is on our side of the fence (credentials,
        sender domain), not a passing outage. Retrying will not help until
        the operator fixes configuration."""
        return self.status in SetupProblem


def as_result(value: "EmailResult | bool") -> EmailResult:
    """Callers and tests may still hand back a plain bool from a replaced
    send_email(); normalise so the rest of the code deals in one type."""
    if isinstance(value, EmailResult):
        return value
    return EmailResult(ok=bool(value), status="accepted" if value else "rejected")


# --------------------------------------------------------------------------
# Branded template
# --------------------------------------------------------------------------

_BRAND_GREEN = "#5D6F34"
_BRAND_GREEN_DARK = "#475426"
_INK = "#0F172A"
_MUTED = "#64748B"
_BORDER = "#E2E8F0"
_BG = "#F1F5F4"


def render_email(
    *,
    preheader: str,
    heading: str,
    body_html: str,
    cta_text: str | None = None,
    cta_url: str | None = None,
    footer_note: str = "",
    show_preferences_link: bool = False,
) -> tuple[str, str]:
    """Renders the shared CareerFound branded layout around one email's
    content. Table-based markup and inline styles throughout, that's not
    an oversight, it's what actually renders consistently across Gmail,
    Outlook, and mobile mail clients. Returns (html, plain_text)."""

    cta_html = ""
    if cta_text and cta_url:
        cta_html = f"""
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
          <tr>
            <td align="center" bgcolor="{_BRAND_GREEN}" style="border-radius: 10px;">
              <a href="{cta_url}" target="_blank"
                 style="display: inline-block; padding: 14px 28px; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                        font-size: 15px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px;">
                {cta_text}
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 0 0 24px; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                   font-size: 12px; line-height: 1.6; color: {_MUTED}; word-break: break-all;">
          Button not working? Paste this link into your browser:<br />
          <a href="{cta_url}" style="color: {_BRAND_GREEN_DARK};">{cta_url}</a>
        </p>
        """

    preferences_html = ""
    if show_preferences_link:
        prefs_url = f"{settings.PUBLIC_APP_URL}/settings"
        preferences_html = f'· <a href="{prefs_url}" style="color: {_MUTED}; text-decoration: underline;">Email preferences</a>'

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{heading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: {_BG};">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">{preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: {_BG};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width: 480px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid {_BORDER};">
          <tr>
            <td bgcolor="{_BRAND_GREEN}" style="padding: 20px 32px;">
              <span style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                           font-size: 16px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em;">
                CareerFound
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                         font-size: 20px; font-weight: 700; color: {_INK};">
                {heading}
              </h1>
              <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                          font-size: 14px; line-height: 1.7; color: {_INK};">
                {body_html}
              </div>
              {cta_html}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid {_BORDER};">
              <p style="margin: 0; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                        font-size: 12px; line-height: 1.6; color: {_MUTED};">
                {footer_note or "CareerFound helps people figure out and start a real path into tech."}
              </p>
              <p style="margin: 8px 0 0; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                        font-size: 12px; color: {_MUTED};">
                Sent by CareerFound &middot; <a href="mailto:{settings.EMAIL_REPLY_TO}" style="color: {_MUTED}; text-decoration: underline;">{settings.EMAIL_REPLY_TO}</a>
                {preferences_html}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    # Minimal, readable plain-text fallback for clients that prefer it.
    text_lines = [heading, "", _strip_tags(body_html)]
    if cta_text and cta_url:
        text_lines += ["", f"{cta_text}: {cta_url}"]
    text_lines += ["", footer_note or "CareerFound", f"Questions? {settings.EMAIL_REPLY_TO}"]
    return html, "\n".join(text_lines)


def _strip_tags(html_fragment: str) -> str:
    import re

    text = re.sub(r"<br\s*/?>", "\n", html_fragment)
    text = re.sub(r"</p>", "\n\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    return "\n".join(line.strip() for line in text.strip().splitlines()).strip()


# --------------------------------------------------------------------------
# Provider dispatch
# --------------------------------------------------------------------------


async def send_email(message: EmailMessage) -> EmailResult:
    """The one place every outbound email in the app goes through. Returns
    an EmailResult (truthy when the provider accepted the message, or when it
    was logged in non-production console mode). Never raises: a broken email
    provider must never break registration, login, or a password-reset
    request."""
    if settings.EMAIL_PROVIDER == "resend":
        return await _send_via_resend(message)
    return _send_via_console(message)


def _send_via_console(message: EmailMessage) -> EmailResult:
    if settings.ENVIRONMENT == "production":
        # A production deployment with EMAIL_PROVIDER left at "console"
        # would otherwise silently never send real email. Surface that
        # loudly instead of pretending it's configured.
        logger.error(
            "EMAIL NOT SENT: ENVIRONMENT=production but EMAIL_PROVIDER=console. "
            "Set EMAIL_PROVIDER=resend and RESEND_API_KEY to send real email. "
            "(subject=%r to=%s)",
            message.subject,
            mask_email(message.to),
        )
        return EmailResult(False, "not_configured", detail="EMAIL_PROVIDER is console in production")
    logger.info("[console email] to=%s subject=%r\n%s", message.to, message.subject, message.text)
    return EmailResult(True, "accepted", detail="logged to console")


def mask_email(address: str) -> str:
    """j***@gmail.com. Used for logs and for anything shown on screen that
    only needs to help a person recognise their own address."""
    local, sep, domain = (address or "").partition("@")
    if not sep or not local:
        return "***"
    return f"{local[0]}{'*' * min(max(len(local) - 1, 2), 6)}@{domain}"


def classify_resend_error(status_code: int, body: str) -> tuple[str, str]:
    """Maps a Resend error response to (status, short operator hint). Matching
    on the message text is deliberate: Resend uses 403 for several different
    problems (bad key, unverified domain, sandbox recipient limits), and the
    only thing that tells them apart is the message."""
    text = (body or "").lower()
    if status_code == 429:
        return "rate_limited", "Resend rate limit hit; slow down or raise the plan limit."
    if status_code in (401, 403) and ("api key" in text or "api_key" in text or status_code == 401):
        return "invalid_api_key", "RESEND_API_KEY is missing, wrong or restricted. Create a Sending access key in Resend and update it."
    if "domain" in text and ("not verified" in text or "verify" in text):
        return "sender_domain_unverified", (
            "The sender domain is not verified in Resend. Add the domain in Resend > Domains, "
            "publish the SPF/DKIM DNS records it shows, wait for 'Verified', or change EMAIL_FROM_ADDRESS."
        )
    if "testing emails" in text or "own email address" in text:
        return "recipient_restricted", "Resend is still in testing mode and only delivers to the account owner's address. Verify a domain."
    if status_code in (400, 422):
        return "address_rejected", "Resend rejected the request (invalid recipient or payload)."
    if status_code >= 500:
        return "provider_unavailable", "Resend returned a server error."
    return "rejected", f"Resend returned HTTP {status_code}."


async def _send_via_resend(message: EmailMessage) -> EmailResult:
    if not settings.RESEND_API_KEY:
        logger.error(
            "EMAIL NOT SENT [not_configured]: EMAIL_PROVIDER=resend but RESEND_API_KEY is not set. (subject=%r to=%s)",
            message.subject,
            mask_email(message.to),
        )
        return EmailResult(False, "not_configured", detail="RESEND_API_KEY is not set")
    payload = {
        "from": f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>",
        "to": [message.to],
        "subject": message.subject,
        "html": message.html,
        "text": message.text,
        "reply_to": settings.EMAIL_REPLY_TO,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                RESEND_API_URL,
                json=payload,
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            )
    except httpx.HTTPError as exc:
        logger.error("EMAIL NOT SENT [network_error]: %s sending to %s", type(exc).__name__, mask_email(message.to))
        return EmailResult(False, "network_error", detail=type(exc).__name__)
    if resp.status_code >= 400:
        status_name, hint = classify_resend_error(resp.status_code, resp.text)
        logger.error(
            "EMAIL NOT SENT [%s]: Resend HTTP %s sending to %s. %s Provider said: %s",
            status_name,
            resp.status_code,
            mask_email(message.to),
            hint,
            resp.text[:300],
        )
        return EmailResult(False, status_name, detail=hint)
    provider_id = None
    try:
        provider_id = resp.json().get("id")
    except Exception:  # an odd 2xx body must never turn an accepted send into a failure
        pass
    logger.info("Email accepted by Resend (id=%s) for %s subject=%r", provider_id, mask_email(message.to), message.subject)
    return EmailResult(True, "accepted", provider_id=provider_id)


async def _deliver(message: EmailMessage) -> EmailResult:
    """Goes through the module-level send_email so tests (and any future
    wrapper) can replace it, then normalises the answer."""
    return as_result(await send_email(message))


# --------------------------------------------------------------------------
# Typed senders
# --------------------------------------------------------------------------


async def send_welcome_email(user: User) -> bool:
    first_name = user.full_name.split(" ")[0] if user.full_name else "there"
    html, text = render_email(
        preheader="Your CareerFound account is ready.",
        heading="Welcome to CareerFound",
        body_html=f"""
            <p style="margin: 0 0 12px;">Hi {first_name},</p>
            <p style="margin: 0 0 12px;">Your account is set up. CareerFound is here to help you figure out a real path into tech
            and actually make progress on it, not just read about it.</p>
            <p style="margin: 0 0 12px;">Here's what's waiting for you: a personalized roadmap for your target role, real projects
            organized by career path, an AI mentor for quick questions, and mentors and consultations when you want a human
            perspective.</p>
            <p style="margin: 0;">Ready to get started?</p>
        """,
        cta_text="Go to CareerFound",
        cta_url=settings.PUBLIC_APP_URL,
        footer_note="You're receiving this because you just created a CareerFound account.",
    )
    return (await _deliver(EmailMessage(to=user.email, subject="Welcome to CareerFound \U0001f680", html=html, text=text))).ok


async def send_verification_email(user: User, raw_token: str) -> EmailResult:
    verify_url = f"{settings.PUBLIC_APP_URL}/verify-email?token={quote(raw_token)}"
    html, text = render_email(
        preheader="Confirm your email address to finish setting up your account.",
        heading="Verify your email address",
        body_html=f"""
            <p style="margin: 0 0 12px;">Hi {user.full_name.split(" ")[0] if user.full_name else "there"},</p>
            <p style="margin: 0 0 12px;">Please confirm this is really your email address so we can keep your CareerFound
            account secure and reach you about anything important.</p>
            <p style="margin: 0;">This link expires in 48 hours.</p>
        """,
        cta_text="Verify my email",
        cta_url=verify_url,
        footer_note="If you didn't create a CareerFound account, you can safely ignore this email.",
    )
    return await _deliver(EmailMessage(to=user.email, subject="Verify your email for CareerFound", html=html, text=text))


async def send_password_reset_email(user: User, raw_token: str) -> bool:
    reset_url = f"{settings.PUBLIC_APP_URL}/reset-password?token={quote(raw_token)}"
    html, text = render_email(
        preheader="Reset your CareerFound password.",
        heading="Reset your password",
        body_html=f"""
            <p style="margin: 0 0 12px;">Hi {user.full_name.split(" ")[0] if user.full_name else "there"},</p>
            <p style="margin: 0 0 12px;">We received a request to reset the password on your CareerFound account. Click below
            to choose a new one. This link expires in 1 hour and can only be used once.</p>
            <p style="margin: 0;">If you didn't request this, you can safely ignore this email, your password won't change.</p>
        """,
        cta_text="Reset my password",
        cta_url=reset_url,
        footer_note="For your security, we never send passwords by email.",
    )
    return (await _deliver(EmailMessage(to=user.email, subject="Reset your CareerFound password", html=html, text=text))).ok


async def send_product_email(user: User, *, subject: str, heading: str, body_html: str, cta_text: str | None = None, cta_url: str | None = None) -> bool:
    """For future optional/product email (career recommendations, roadmap
    nudges, project reminders). Silently does nothing unless the user has
    explicitly opted in, this function is the enforcement point for that
    rule so no future caller can accidentally bypass it."""
    if not user.marketing_opt_in:
        return False
    html, text = render_email(
        preheader=heading,
        heading=heading,
        body_html=body_html,
        cta_text=cta_text,
        cta_url=cta_url,
        footer_note="You're receiving this because you opted in to product updates in your CareerFound email preferences.",
        show_preferences_link=True,
    )
    return (await _deliver(EmailMessage(to=user.email, subject=subject, html=html, text=text, category="product"))).ok


_SERVICE_LABELS = {"mentorship": "1:1 Career Mentorship", "consultation": "Career Consultation"}


async def send_service_request_confirmation(*, name: str, email: str, service: str) -> bool:
    """Confirms receipt of a paid-service request (mentorship or
    consultation) to the person who submitted it. This is a request, not a
    payment confirmation, no payment has been taken, that's made explicit
    in the copy since there is no live payment processor connected yet."""
    first_name = _html.escape(name.split(" ")[0]) if name else "there"
    service_label = _SERVICE_LABELS.get(service, service)
    html, text = render_email(
        preheader=f"We received your {service_label} request.",
        heading="Got your request",
        body_html=f"""
            <p style="margin: 0 0 12px;">Hi {first_name},</p>
            <p style="margin: 0 0 12px;">Thanks for requesting <strong>{service_label}</strong> with CareerFound. This is not a payment confirmation, nothing has been charged. We'll reply personally by email to arrange payment and scheduling.</p>
            <p style="margin: 0;">If anything changes on your end in the meantime, just reply to this email.</p>
        """,
        footer_note="You're receiving this because you requested a paid CareerFound service.",
    )
    return (await _deliver(
        EmailMessage(to=email, subject=f"We received your {service_label} request", html=html, text=text)
    )).ok


async def send_service_request_notification(*, name: str, email: str, service: str, message: str) -> bool:
    """Internal notification so a new paid-service lead is actually seen,
    sent to settings.EMAIL_REPLY_TO (the team inbox), not to the requester.
    """
    service_label = _SERVICE_LABELS.get(service, service)
    # Everything the visitor typed is untrusted: escape it so a request cannot
    # put links or markup into an email that lands in the team inbox.
    safe_message = _html.escape(message.strip()) or "(no message provided)"
    safe_name, safe_email = _html.escape(name), _html.escape(email)
    html, text = render_email(
        preheader=f"New {service_label} request from {safe_name}.",
        heading="New service request",
        body_html=f"""
            <p style="margin: 0 0 12px;"><strong>{service_label}</strong> requested by {safe_name} ({safe_email}).</p>
            <p style="margin: 0 0 6px; color: {_MUTED}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;">Message</p>
            <p style="margin: 0; white-space: pre-wrap;">{safe_message}</p>
        """,
        footer_note="Internal notification, sent to the CareerFound team inbox.",
    )
    return (await _deliver(
        EmailMessage(to=settings.EMAIL_REPLY_TO, subject=f"New {service_label} request: {name}", html=html, text=text)
    )).ok


async def send_mentor_request_notification(
    *, mentor_name: str, mentor_email: str | None, mentee_name: str, mentee_email: str, kind: str, topic: str, summary: str
) -> bool:
    """Tells the team inbox (and the mentor, when we hold a verified address
    for them) that someone asked a mentor for a session or sent a question.
    Without this a request is only a database row that nobody looks at.
    Returns True when the team copy was accepted by the email provider."""
    what = "question" if kind == "question" else "session request"
    safe = {k: _html.escape(v or "") for k, v in dict(mentor=mentor_name, name=mentee_name, email=mentee_email, topic=topic, summary=summary).items()}
    html, text = render_email(
        preheader=f"New {what} for {safe['mentor']} from {safe['name']}.",
        heading=f"New {what} for {safe['mentor']}",
        body_html=f"""
            <p style="margin: 0 0 12px;">{safe['name']} ({safe['email']}) sent {safe['mentor']} a {what}. Reply to the person directly to arrange the next step. Nothing has been charged.</p>
            <p style="margin: 0 0 6px; color: {_MUTED}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;">Topic</p>
            <p style="margin: 0 0 12px;">{safe['topic'] or "Not given"}</p>
            <p style="margin: 0 0 6px; color: {_MUTED}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;">What they shared</p>
            <p style="margin: 0; white-space: pre-wrap;">{safe['summary']}</p>
        """,
        footer_note="Internal notification from the CareerFound mentor marketplace.",
    )
    subject = f"New {what} for {mentor_name} from {mentee_name}"
    team_ok = await send_email(EmailMessage(to=settings.EMAIL_REPLY_TO, subject=subject, html=html, text=text))
    if mentor_email and mentor_email.lower() != settings.EMAIL_REPLY_TO.lower():
        await send_email(EmailMessage(to=mentor_email, subject=subject, html=html, text=text))
    return team_ok


async def send_mentor_request_confirmation(*, mentee_name: str, mentee_email: str, mentor_name: str, kind: str) -> bool:
    """Confirms to the person that their request was received. It is a receipt,
    not a booking: a mentor has not accepted anything and nothing is charged."""
    what = "question" if kind == "question" else "session request"
    first = _html.escape(mentee_name.split(" ")[0]) if mentee_name else "there"
    html, text = render_email(
        preheader=f"We received your {what} for {_html.escape(mentor_name)}.",
        heading="Got your request",
        body_html=f"""
            <p style="margin: 0 0 12px;">Hi {first},</p>
            <p style="margin: 0 0 12px;">We received your {what} for <strong>{_html.escape(mentor_name)}</strong>. This is not a confirmed booking and nothing has been charged. The CareerFound team will reply to this address to arrange the next step.</p>
            <p style="margin: 0;">If you need to add anything, just reply to this email.</p>
        """,
        footer_note="You're receiving this because you sent a request through the CareerFound mentor marketplace.",
    )
    return (await _deliver(EmailMessage(to=mentee_email, subject=f"We received your {what} for {mentor_name}", html=html, text=text))).ok
