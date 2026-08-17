import pytest
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.career import CareerPath
from app.seed.career_paths import CAREER_PATHS

pytestmark = pytest.mark.asyncio


async def _seed_paths():
    async with AsyncSessionLocal() as db:
        for data in CAREER_PATHS:
            db.add(CareerPath(**data))
        await db.commit()


async def _register(client, email="assess@example.com"):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePass123!", "full_name": "Assess User"},
    )
    return resp.json()["access_token"]


async def test_assessment_requires_auth(client):
    resp = await client.post("/api/v1/assessment", json={"answers": {}})
    assert resp.status_code == 401


async def test_assessment_returns_three_tiered_recommendations(client):
    await _seed_paths()
    token = await _register(client)
    resp = await client.post(
        "/api/v1/assessment",
        headers={"Authorization": f"Bearer {token}"},
        json={"answers": {"enjoys_problem_solving": True, "prefers_systems": True, "enjoys_math": True}},
    )
    assert resp.status_code == 201
    body = resp.json()
    tiers = {r["tier"] for r in body["recommendations"]}
    assert tiers == {"best_match", "strong_alternative", "wild_card"}
    assert len(body["recommendations"]) == 3
    for rec in body["recommendations"]:
        assert 0 <= rec["fit_score"] <= 100
        assert rec["why_it_fits"]
        assert rec["recommended_next_step"]


async def test_career_dna_axes_bounded(client):
    await _seed_paths()
    token = await _register(client, "dna@example.com")
    resp = await client.post(
        "/api/v1/assessment",
        headers={"Authorization": f"Bearer {token}"},
        json={"answers": {"enjoys_creativity": True}},
    )
    dna = resp.json()["career_dna"]
    for axis in ["problem_solving", "mathematics", "creativity", "people_orientation", "systems_thinking", "communication"]:
        assert 0 <= dna[axis] <= 100
