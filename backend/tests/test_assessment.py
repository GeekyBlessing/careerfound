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


async def _top_slug(client, token, answers):
    resp = await client.post(
        "/api/v1/assessment", headers={"Authorization": f"Bearer {token}"}, json={"answers": answers}
    )
    assert resp.status_code == 201
    recs = {r["tier"]: r for r in resp.json()["recommendations"]}
    return recs


async def test_journey_signals_steer_the_match_and_show_in_the_result(client):
    await _seed_paths()
    token = await _register(client, "journey@example.com")

    design = await _top_slug(
        client,
        token,
        {
            "enjoys_creativity": True,
            "things_enjoyed": ["interfaces"],
            "existing_skills": ["creativity"],
            "tech_interests": ["design"],
            "preferred_category": "design-product",
        },
    )
    assert design["best_match"]["path_slug"] in {"ui-ux-design", "product-design", "graphic-design"}
    assert "drawn to" in design["best_match"]["why_it_fits"]

    cloud = await _top_slug(
        client,
        token,
        {
            "prefers_systems": True,
            "things_enjoyed": ["infrastructure"],
            "tech_interests": ["cloud"],
            "preferred_category": "cloud-infrastructure",
        },
    )
    assert cloud["best_match"]["path_slug"] in {"cloud-engineering", "devops-engineering"}
    # The wild card still comes from a different category than the top two.
    assert cloud["wild_card"]["path_slug"] not in {"cloud-engineering", "devops-engineering", "solutions-architecture"}


async def test_unknown_signal_ids_are_ignored(client):
    await _seed_paths()
    token = await _register(client, "junk@example.com")
    recs = await _top_slug(client, token, {"things_enjoyed": ["not-a-real-tag"], "preferred_category": "nope"})
    assert set(recs) == {"best_match", "strong_alternative", "wild_card"}


# ---- explainable results ----------------------------------------------------

import re  # noqa: E402
from pathlib import Path  # noqa: E402

from app.ai.assessment_signals import INTERESTS, LEARNING_STYLES, PROBLEM_STYLES, STRENGTHS, TECH_INTERESTS  # noqa: E402
from app.models.roadmap import Project, RoadmapPhase  # noqa: E402
from app.schemas.assessment import AssessmentOut  # noqa: E402

SECURITY = {
    "things_enjoyed": ["puzzles", "security"],
    "existing_skills": ["logic", "detail"],
    "tech_interests": ["security"],
    "problem_styles": ["trace"],
    "enjoys_problem_solving": True,
    "prefers_systems": True,
    "preferred_category": "security",
}
DESIGN = {
    "things_enjoyed": ["interfaces", "writing"],
    "existing_skills": ["creativity", "communication"],
    "tech_interests": ["design"],
    "problem_styles": ["sketch", "ask"],
    "enjoys_creativity": True,
    "enjoys_people": True,
}
DATA = {
    "things_enjoyed": ["data", "ai"],
    "existing_skills": ["numbers"],
    "tech_interests": ["data"],
    "problem_styles": ["measure"],
    "enjoys_math": True,
}


async def _full(client, token, answers):
    resp = await client.post("/api/v1/assessment", headers={"Authorization": f"Bearer {token}"}, json={"answers": answers})
    assert resp.status_code == 201
    return resp.json()


async def test_different_answers_give_different_recommendations(client):
    await _seed_paths()
    token = await _register(client, "diff@example.com")
    tops = {}
    for name, answers in {"security": SECURITY, "design": DESIGN, "data": DATA}.items():
        body = await _full(client, token, answers)
        tops[name] = [r["path_slug"] for r in body["recommendations"]]
    assert len({t[0] for t in tops.values()}) == 3
    assert tops["security"][0] in {"cybersecurity", "security-operations", "penetration-testing", "cloud-security",
                                    "application-security", "detection-engineering"}
    assert tops["design"][0] in {"ui-ux-design", "product-design", "graphic-design", "motion-design"}
    assert tops["data"][0] in {"data-analysis", "data-science", "data-engineering", "machine-learning-engineering",
                                "business-intelligence-engineering", "analytics-engineering"}


async def test_same_answers_give_the_same_result(client):
    await _seed_paths()
    token = await _register(client, "same@example.com")
    a = await _full(client, token, SECURITY)
    b = await _full(client, token, SECURITY)
    assert [r["path_slug"] for r in a["recommendations"]] == [r["path_slug"] for r in b["recommendations"]]
    assert a["career_dna"] == b["career_dna"]


async def test_results_name_the_answers_that_led_to_them(client):
    await _seed_paths()
    token = await _register(client, "why@example.com")
    body = await _full(client, token, SECURITY)
    best = next(r for r in body["recommendations"] if r["tier"] == "best_match")
    assert best["matched_interests"] and best["matched_technology"]
    assert "It ranks here because" in best["why_it_fits"]
    assert best["matched_interests"][0].lower() in best["why_it_fits"].lower()
    # The three results are explained as different from each other.
    others = [r for r in body["recommendations"] if r["tier"] != "best_match"]
    assert all(r["how_it_differs"] for r in others)
    assert "different angle" in next(r for r in others if r["tier"] == "wild_card")["why_it_fits"]


async def test_interests_alone_are_never_reported_as_skills(client):
    await _seed_paths()
    token = await _register(client, "noskills@example.com")
    body = await _full(client, token, {"things_enjoyed": ["data", "ai", "puzzles"], "tech_interests": ["data"]})
    for rec in body["recommendations"]:
        assert rec["transferable_skills"] == []
    with_strength = await _full(client, token, {"things_enjoyed": ["data"], "existing_skills": ["numbers"]})
    best = with_strength["recommendations"][0]
    assert [s["skill"] for s in best["transferable_skills"]] == ["Being at ease with figures"]
    assert best["transferable_skills"][0]["why_it_transfers"]


async def test_no_placeholder_projects_or_steps(client):
    await _seed_paths()
    token = await _register(client, "noplaceholder@example.com")
    body = await _full(client, token, DATA)
    for rec in body["recommendations"]:
        text = " ".join(rec["example_projects"] + [rec["recommended_next_step"]])
        assert "Beginner project in" not in text
        assert "guided mini-project" not in text
        assert "no prior experience required" not in text
        assert rec["first_project"] is None  # no projects are seeded in this test
        assert rec["example_projects"] == []


async def test_first_project_and_phase_come_from_the_catalogue(client):
    await _seed_paths()
    token = await _register(client, "facts@example.com")
    slug = (await _full(client, token, DATA))["recommendations"][0]["path_slug"]
    async with AsyncSessionLocal() as db:
        path = (await db.execute(select(CareerPath).where(CareerPath.slug == slug))).scalar_one()
        p0 = RoadmapPhase(path_id=path.id, order_index=0, title="Foundations", summary="Learn the basics. Then more.")
        p1 = RoadmapPhase(path_id=path.id, order_index=1, title="Building Real Skills", summary="Go further.")
        db.add_all([p0, p1])
        await db.flush()
        hard = Project(phase_id=p1.id, order_index=0, title="Hard one", teaches="x", difficulty=3)
        easy = Project(phase_id=p0.id, order_index=0, title="Easy one", teaches="Cleaning data. Second sentence.", difficulty=1)
        db.add_all([hard, easy])
        await db.commit()
        easy_id = str(easy.id)
    body = await _full(client, token, DATA)
    rec = next(r for r in body["recommendations"] if r["path_slug"] == slug)
    assert rec["first_project"]["title"] == "Easy one"
    assert rec["first_project"]["id"] == easy_id
    assert rec["first_project"]["teaches"] == "Cleaning data."
    assert rec["first_phase"] == {"title": "Foundations", "summary": "Learn the basics."}
    assert rec["recommended_next_step"] == "Start with Foundations. Learn the basics."
    assert rec["example_projects"] == ["Easy one"]


async def test_notes_reflect_remote_timeline_and_learning_style(client):
    await _seed_paths()
    token = await _register(client, "notes@example.com")
    body = await _full(
        client, token, {**SECURITY, "wants_remote": True, "career_timeline": "3_months", "learning_style": "building"}
    )
    notes = " ".join(n for r in body["recommendations"] for n in r["things_to_consider"])
    assert "weeks" in notes and "3 months" in notes
    assert all(r["learning_note"] == LEARNING_STYLES["building"][1] for r in body["recommendations"])
    quiet = await _full(client, token, SECURITY)
    assert all(r["learning_note"] == "" for r in quiet["recommendations"])


async def test_career_dna_follows_the_answers_and_is_not_random(client):
    await _seed_paths()
    token = await _register(client, "dnaq@example.com")
    design = (await _full(client, token, DESIGN))["career_dna"]
    data = (await _full(client, token, DATA))["career_dna"]
    assert design["creativity"] > design["mathematics"]
    assert data["mathematics"] > data["creativity"]
    nothing = (await _full(client, token, {"things_enjoyed": ["apps"]}))["career_dna"]
    assert {nothing[k] for k in ("mathematics", "creativity", "people_orientation", "communication")} == {15}
    assert "not how good you are" in design["summary"]


async def test_new_answer_fields_are_stored(client):
    await _seed_paths()
    token = await _register(client, "store@example.com")
    await _full(client, token, {"problem_styles": ["trace", "map"], "learning_style": "guided", "people_preference": "both"})
    latest = await client.get("/api/v1/assessment/latest", headers={"Authorization": f"Bearer {token}"})
    assert latest.status_code == 200
    assert latest.json()["recommendations"]


def test_results_saved_before_the_new_fields_still_load():
    old = {
        "id": "00000000-0000-0000-0000-000000000001",
        "created_at": "2026-01-01T00:00:00",
        "career_dna": {"summary": "x"},
        "recommendations": [
            {
                "path_slug": "cybersecurity", "tier": "best_match", "fit_score": 80, "why_it_fits": "old",
                "transferable_skills": [], "skills_to_develop": [], "difficulty_label": "d", "timeline_label": "t",
                "entry_roles": [], "example_projects": [], "tools": [], "earning_notes": "", "remote_potential_label": "r",
                "recommended_next_step": "s",
            }
        ],
    }
    out = AssessmentOut.model_validate(old)
    assert out.recommendations[0].first_project is None
    assert out.recommendations[0].matched_interests == []


def _ts_ids(name: str) -> set[str]:
    src = (Path(__file__).resolve().parents[2] / "frontend" / "src" / "lib" / "discovery.ts").read_text()
    block = re.search(rf"export const {name}: Choice\[\] = \[(.*?)\n\];", src, re.S).group(1)
    return set(re.findall(r'\{ id: "([^"]+)"', block))


def test_frontend_answer_ids_match_the_scoring_vocabulary():
    """The ids the onboarding page sends must be ones the scorer knows."""
    assert _ts_ids("INTEREST_CHOICES") == set(INTERESTS)
    assert _ts_ids("STRENGTH_CHOICES") == set(STRENGTHS)
    assert _ts_ids("TECH_CHOICES") == set(TECH_INTERESTS)
    assert _ts_ids("PROBLEM_STYLE_CHOICES") == set(PROBLEM_STYLES)
    assert _ts_ids("LEARNING_CHOICES") == set(LEARNING_STYLES)


async def test_visual_interest_and_way_of_working_reach_narrow_careers(client):
    await _seed_paths()
    token = await _register(client, "narrow@example.com")
    graphic = await _top_slug(
        client, token, {"things_enjoyed": ["visual"], "existing_skills": ["creativity"], "tech_interests": ["design"],
                        "problem_styles": ["sketch"], "enjoys_creativity": True}
    )
    assert graphic["best_match"]["path_slug"] == "graphic-design"
    mapper = await _top_slug(
        client, token, {"things_enjoyed": ["security"], "problem_styles": ["map"], "prefers_systems": True,
                        "tech_interests": ["security"], "preferred_category": "security"}
    )
    assert mapper["best_match"]["path_slug"] in {"security-engineering", "cloud-security", "identity-access-management", "cybersecurity"}
    assert "map how the parts connect" in mapper["best_match"]["why_it_fits"]
