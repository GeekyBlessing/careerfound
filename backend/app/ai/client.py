from functools import lru_cache

from app.ai.providers import AnthropicProvider, LLMClient, MockLLMProvider
from app.core.config import settings


@lru_cache
def get_llm_client() -> LLMClient:
    if settings.LLM_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
        return AnthropicProvider()
    return MockLLMProvider()
