from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(prefix="/config", tags=["config"])


@router.get("")
async def public_config():
    """Public, non-secret feature flags the frontend needs at load time."""
    return {
        "google_auth_enabled": bool(settings.GOOGLE_OAUTH_CLIENT_ID),
        "payments_enabled": bool(settings.STRIPE_SECRET_KEY),
        "ai_provider": settings.LLM_PROVIDER,
        "environment": settings.ENVIRONMENT,
    }
