import pytest
import uuid

from app.db.session import AsyncSessionLocal
from app.services import readiness_service

pytestmark = pytest.mark.asyncio


async def test_readiness_score_zero_with_no_progress():
    async with AsyncSessionLocal() as db:
        score = await readiness_service.compute_readiness(db, uuid.uuid4())
    assert score.overall == 0
    assert score.knowledge_pct == 0
    assert len(score.next_actions) == 2


async def test_readiness_weights_sum_to_one():
    assert abs(sum(readiness_service.WEIGHTS.values()) - 1.0) < 1e-9
