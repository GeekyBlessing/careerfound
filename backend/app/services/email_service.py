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


async def send_email(message: EmailMessage) -> bool:
    """The one place every outbound email in the app goes through. Returns
    True if the send was accepted by the provider (or logged, in console
    mode), False if it failed. Never raises: a broken email provider must
    never break registration, login, or a password-reset request."""
    if settings.EMAIL_PROVIDER == "resend":
        return await _send_via_resend(message)
    return _send_via_console(message)


def _send_via_console(message: EmailMessage) -> bool:
    if settings.ENVIRONMENT == "production":
        # A production deployment with EMAIL_PROVIDER left at "console"
        # would otherwise silently never send real email. Surface that
        # loudly instead of pretending it's configured.
        logger.warning(
            "EMAIL NOT SENT: ENVIRONMENT=production but EMAIL_PROVIDER=console. "
            "Set EMAIL_PROVIDER=resend and RESEND_API_KEY to send real email. "
            "(subject=%r to=%r)",
            message.subject,
            message.to,
        )
        return False
    logger.info("[console email] to=%s subject=%r\n%s", message.to, message.subject, message.text)
    return True


async def _send_via_resend(message: EmailMessage) -> bool:
    if not settings.RESEND_API_KEY:
        logger.error(
            "EMAIL NOT SENT: EMAIL_PROVIDER=resend but RESEND_API_KEY is not set. (subject=%r to=%r)",
            message.subject,
            message.to,
        )
        return False
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
        if resp.status_code >= 400:
            logger.error("Resend API error %s sending to %s: %s", resp.status_code, message.to, resp.text[:500])
            return False
        return True
    except httpx.HTTPError:
        logger.exception("Network error sending email to %s", message.to)
        return False


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
    return await send_email(EmailMessage(to=user.email, subject="Welcome to CareerFound \U0001f680", html=html, text=text))


async def send_verification_email(user: User, raw_token: str) -> bool:
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
    return await send_email(EmailMessage(to=user.email, subject="Verify your email for CareerFound", html=html, text=text))


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
    return await send_email(EmailMessage(to=user.email, subject="Reset your CareerFound password", html=html, text=text))


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
    return await send_email(EmailMessage(to=user.email, subject=subject, html=html, text=text, category="product"))
