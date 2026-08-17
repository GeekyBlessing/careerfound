import asyncio
import os

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.rate_limit import limiter
from app.db.base import Base
from app.db.session import engine


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db():
    # The rate limiter is an in-process singleton keyed by client IP, so
    # without a reset here, tests that make several auth calls (register/
    # login) accumulate hits across the whole test session and can start
    # 429ing late in the run even though each test is otherwise independent.
    limiter._hits.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
