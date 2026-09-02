import pytest
import uuid

from app.db.session import AsyncSessionLocal
from app.services import readiness_service
from app.models.career import CareerPath
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Lesson, Roadmap, RoadmapPhase, RoadmapStatus

pytestmark = pytest.mark.asyncio


async def test_readiness_score_zero_with_no_progress():
    async with AsyncSessionLocal() as db:
        score = await readiness_service.compute_readiness(db, uuid.uuid4())
    assert score.overall == 0
    assert score.knowledge_pct == 0
    assert len(score.next_actions) == 2


async def test_readiness_weights_sum_to_one():
    assert abs(sum(readiness_service.WEIGHTS.values()) - 1.0) < 1e-9


async def test_readiness_scoped_to_users_own_path_not_whole_platform():
    """Regression test: knowledge_pct must be computed against the user's
    own active path's lessons, not every lesson on the platform. Before the
    fix, a user who finished 1 of 2 lessons on a small path would score
    against the platform-wide lesson total instead, understating their
    progress on any path that isn't the platform's biggest.
    """
    user_id = uuid.uuid4()
    async with AsyncSessionLocal() as db:
        small_path = CareerPath(
            slug="test-small-path", name="Small Path", summary="s", beginner_summary="s",
            difficulty=1, avg_timeline_weeks=1, entry_roles=[], tools=[], remote_potential=0,
            earning_notes="", icon="star",
        )
        big_path = CareerPath(
            slug="test-big-path", name="Big Path", summary="s", beginner_summary="s",
            difficulty=1, avg_timeline_weeks=1, entry_roles=[], tools=[], remote_potential=0,
            earning_notes="", icon="star",
        )
        db.add_all([small_path, big_path])
        await db.flush()

        small_phase = RoadmapPhase(path_id=small_path.id, title="Phase 1", summary="s", order_index=0)
        big_phase = RoadmapPhase(path_id=big_path.id, title="Phase 1", summary="s", order_index=0)
        db.add_all([small_phase, big_phase])
        await db.flush()

        # Small path: 2 lessons total, user completes 1 (should score 50%).
        # Big path: 3 unrelated lessons the user never touches, present only
        # to prove they don't dilute the small-path score.
        lesson_1 = Lesson(phase_id=small_phase.id, title="L1", concept_summary="s", order_index=0, est_minutes=10)
        lesson_2 = Lesson(phase_id=small_phase.id, title="L2", concept_summary="s", order_index=1, est_minutes=10)
        for i in range(3):
            db.add(Lesson(phase_id=big_phase.id, title=f"Big L{i}", concept_summary="s", order_index=i, est_minutes=10))
        db.add_all([lesson_1, lesson_2])
        await db.flush()

        db.add(Roadmap(user_id=user_id, path_id=small_path.id, status=RoadmapStatus.active))
        db.add(UserProgress(user_id=user_id, lesson_id=lesson_1.id, status=ProgressStatus.completed))
        await db.commit()

        score = await readiness_service.compute_readiness(db, user_id)

    assert score.knowledge_pct == 50
