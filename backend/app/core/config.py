"""
Centralized application configuration.

All environment-dependent values live here and nowhere else. This is the ONLY
file that should read from os.environ (via pydantic-settings). Never hardcode
secrets or provider keys elsewhere in the codebase.
"""
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- App ---
    APP_NAME: str = "CareerFound API"
    ENVIRONMENT: Literal["development", "staging", "production", "test"] = "development"
    API_V1_PREFIX: str = "/api/v1"

    # Allowed CORS origin(s) for the frontend. Accepts a single origin or a
    # comma-separated list (e.g. apex + www). Defaults to local dev; set to
    # the real domain(s) in production, e.g.
    # "https://mycareerfound.com,https://www.mycareerfound.com". Production
    # domain: mycareerfound.com (DNS/hosting not connected yet — see
    # .env.production.example and infra/README.md).
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # Canonical public URL of the frontend app, used anywhere the backend
    # needs to build an absolute link back to the app (e.g. a future
    # password-reset email, or documenting OAuth "Authorized JavaScript
    # origins"). Defaults to local dev; set to "https://mycareerfound.com"
    # in production.
    PUBLIC_APP_URL: str = "http://localhost:3000"

    # --- Database ---
    # Defaults to a local sqlite file so `uvicorn app.main:app` works with zero
    # setup for quick evaluation. docker-compose overrides this to Postgres.
    DATABASE_URL: str = "sqlite+aiosqlite:///./careerfound.db"

    # --- Auth / security ---
    JWT_SECRET_KEY: str = "CHANGE_ME_INSECURE_DEV_ONLY_SECRET"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30d

    # Google OAuth — integration point. Leave blank to keep the "Continue with
    # Google" button disabled (frontend detects this via /api/v1/config).
    GOOGLE_OAUTH_CLIENT_ID: str = ""
    GOOGLE_OAUTH_CLIENT_SECRET: str = ""

    # --- AI provider abstraction ---
    # "mock" (default) returns realistic, structured canned responses so every
    # AI feature is fully demoable with zero external calls or cost.
    # Set to "anthropic" + provide ANTHROPIC_API_KEY to go live with no other
    # code changes required anywhere in the app.
    LLM_PROVIDER: Literal["mock", "anthropic"] = "mock"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-5"

    # --- Payments — integration point (not wired live in this build) ---
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # --- Transactional email ---
    # "console" (default) logs the rendered email instead of sending it, so
    # registration/password-reset flows work with zero setup in local dev
    # and tests. Set EMAIL_PROVIDER=resend and RESEND_API_KEY to send real
    # email, no other code changes required anywhere in the app. Mirrors the
    # LLM_PROVIDER mock/live pattern above.
    EMAIL_PROVIDER: Literal["console", "resend"] = "console"
    RESEND_API_KEY: str = ""
    EMAIL_FROM_NAME: str = "CareerFound"
    # Must be an address at a domain verified with the email provider (SPF/
    # DKIM records added, see docs). Defaults to the project's domain; not a
    # placeholder that silently fails, see infra/README.md before going live.
    EMAIL_FROM_ADDRESS: str = "no-reply@mycareerfound.com"
    EMAIL_REPLY_TO: str = "hello@mycareerfound.com"

    # --- Rate limiting ---
    AI_RATE_LIMIT_PER_MINUTE: int = 20
    AUTH_RATE_LIMIT_PER_MINUTE: int = 10
    EMAIL_RATE_LIMIT_PER_MINUTE: int = 5

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    @property
    def email_live(self) -> bool:
        """True only when a real provider is configured with credentials.
        Used to decide whether to warn/log instead of silently pretending
        email is going out (see EMAIL_PROVIDER docstring above)."""
        return self.EMAIL_PROVIDER == "resend" and bool(self.RESEND_API_KEY)

    @property
    def frontend_origins(self) -> list[str]:
        """Parsed form of FRONTEND_ORIGIN — one origin or a comma-separated
        list — for passing straight to CORSMiddleware(allow_origins=...)."""
        return [origin.strip() for origin in self.FRONTEND_ORIGIN.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
