"""Integrity tests for the career catalogue and taxonomy.

These guard the product promise behind the catalogue: every career is a real,
distinct path (not a category, and not a renamed copy of a neighbour), every
career page is complete, relationships are mutual, old URLs keep working, and
the frontend taxonomy mirrors the backend one.
"""

import itertools
import json
import re
from pathlib import Path

import pytest
from sqlalchemy import select

from app.ai.providers import _BEGINNER_EXPLAINERS, _TRAIT_WEIGHTS, _pick_top_three, _score_paths
from app.db.session import AsyncSessionLocal
from app.models.career import CareerPath
from app.models.marketplace import Mentor
from app.models.portfolio import PortfolioItem
from app.models.progress import ProgressStatus, UserProgress
from app.models.roadmap import Project, RoadmapPhase
from app.seed import export_catalogue
from app.seed.career_catalogue_meta import CATALOGUE_ORDER
from app.seed.career_paths import CAREER_PATHS
from app.seed.catalogue_sync import normalize_mentor_tags
from app.seed.roadmap_content_extra import PATH_PROJECTS
from app.seed.seed_data import seed_career_paths, seed_roadmap_content, seed_users
from app.services.career_taxonomy import (
    CATEGORIES,
    CATEGORY_LABELS,
    CATEGORY_SLUGS,
    LEGACY_SLUG_REDIRECTS,
    canonical_slug,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
BY_SLUG = {p["slug"]: p for p in CAREER_PATHS}
FULL_CURRICULUM_SLUGS = {"cybersecurity", "software-engineering"}


def _words(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9+#.]+", text.lower()))


# --- taxonomy ---------------------------------------------------------------


def test_catalogue_has_unique_slugs_in_declared_order():
    slugs = [p["slug"] for p in CAREER_PATHS]
    assert len(slugs) == len(set(slugs)) == 48
    assert slugs == CATALOGUE_ORDER


def test_every_career_has_one_valid_category_and_categories_are_not_careers():
    for path in CAREER_PATHS:
        assert path["category"] in CATEGORY_SLUGS, path["slug"]
    used = {p["category"] for p in CAREER_PATHS}
    assert used == set(CATEGORY_SLUGS), "every category should contain careers"

    # A category is a group, never a career. Two categories share their name
    # with their general career (Cybersecurity, Software Engineering) because
    # that is what the field is called; no other label may match a career.
    names = {p["name"].lower() for p in CAREER_PATHS}
    for slug, label in CATEGORY_LABELS.items():
        if label.lower() in names:
            assert label in ("Cybersecurity", "Software Engineering"), f"category '{label}' must not also be a career"
            assert BY_SLUG[label.lower().replace(" ", "-")]["category"] == slug
    for slug in CATEGORY_SLUGS:
        assert slug not in BY_SLUG


def test_career_names_never_stutter():
    for path in CAREER_PATHS:
        words = path["name"].lower().split()
        for a, b in zip(words, words[1:]):
            assert a != b, path["name"]
        # No "Cybersecurity Security", "Software Engineering Engineering" style names.
        label_words = {w.strip("&") for w in CATEGORY_LABELS[path["category"]].lower().split()}
        stem = words[0]
        assert not (len(words) == 2 and stem.startswith(words[1]) and words[1] in label_words), path["name"]


def test_ai_engineering_and_machine_learning_engineering_teach_different_things():
    assert BY_SLUG["ai-engineering"]["name"] == "AI Engineering"
    assert BY_SLUG["machine-learning-engineering"]["name"] == "Machine Learning Engineering"
    ai_text = " ".join(
        [BY_SLUG["ai-engineering"]["summary"]] + BY_SLUG["ai-engineering"]["tools"] + BY_SLUG["ai-engineering"]["skills_required"]
        + [proj["title"] for ph in PATH_PROJECTS["ai-engineering"]["phases"] for proj in ph["projects"]]
    ).lower()
    ml_text = " ".join(
        [BY_SLUG["machine-learning-engineering"]["summary"]] + BY_SLUG["machine-learning-engineering"]["tools"]
        + BY_SLUG["machine-learning-engineering"]["skills_required"]
        + [proj["title"] for ph in PATH_PROJECTS["machine-learning-engineering"]["phases"] for proj in ph["projects"]]
    ).lower()
    # AI Engineering builds on foundation models; ML Engineering trains and serves its own models.
    for term in ("llm", "prompt", "retrieval", "tool"):
        assert term in ai_text, term
        assert term not in ml_text, term
    for term in ("validation", "leakage", "xgboost", "pytorch"):
        assert term in ml_text, term
    assert not set(BY_SLUG["ai-engineering"]["tools"]) & set(BY_SLUG["machine-learning-engineering"]["tools"]) - {"Python", "FastAPI"}
    assert "machine-learning-engineering" in BY_SLUG["ai-engineering"]["related_slugs"]


def test_ui_ux_and_product_design_have_clearly_different_outcomes():
    assert BY_SLUG["ui-ux-design"]["portfolio_expectations"] != BY_SLUG["product-design"]["portfolio_expectations"]
    ux = " ".join(BY_SLUG["ui-ux-design"]["portfolio_expectations"]).lower()
    pd = " ".join(BY_SLUG["product-design"]["portfolio_expectations"]).lower()
    assert "usability" in ux and "design system" in pd
    assert "design system" not in ux and "usability" not in pd


def test_the_catalogue_is_exactly_the_agreed_forty_eight_careers_in_six_categories():
    agreed = {
        "engineering": ["Software Engineering", "Frontend Development", "Backend Development", "Full-Stack Development",
                        "Mobile Engineering", "Game Development", "QA Engineering", "Embedded Systems Engineering"],
        "cloud-infrastructure": ["Cloud Engineering", "DevOps Engineering", "Site Reliability Engineering (SRE)",
                                 "Platform Engineering", "Solutions Architecture", "Systems Administration",
                                 "Network Engineering", "Database Administration"],
        "security": ["Cybersecurity", "Security Operations (SOC Analyst)", "Penetration Testing", "Cloud Security Engineering",
                     "Application Security Engineering", "Digital Forensics and Incident Response", "Security Engineering",
                     "Identity and Access Management (IAM)", "Governance, Risk and Compliance (GRC)", "Detection Engineering"],
        "data-ai": ["Data Analysis", "Business Intelligence Engineering", "Data Engineering", "Data Science",
                    "Machine Learning Engineering", "AI Engineering", "MLOps Engineering", "Analytics Engineering"],
        "design-product": ["UI/UX Design", "Product Design", "Graphic Design", "Motion Design", "Product Management",
                           "Business Analysis", "UX Research"],
        "operations-digital": ["IT Support", "IT Service Management", "No-Code Development", "Workflow Automation",
                               "Technical Writing", "Solutions Consulting", "Technical Support Engineering"],
    }
    assert list(agreed) == CATEGORY_SLUGS
    for category, names in agreed.items():
        assert sorted(p["name"] for p in CAREER_PATHS if p["category"] == category) == sorted(names), category
    assert [CATEGORY_LABELS[c] for c in CATEGORY_SLUGS] == [
        "Software Engineering", "Cloud, Infrastructure & DevOps", "Cybersecurity", "Data & Artificial Intelligence",
        "Design & Product", "IT, Automation & Technical Communication",
    ]


def test_every_published_career_passes_the_content_rules():
    """Required sections, no placeholders, no invented salaries, no long dashes and nothing copied between careers."""
    from app.seed.catalogue_validation import check_catalogue

    problems = check_catalogue([dict(p) for p in CAREER_PATHS], dict(PATH_PROJECTS), light_only=set(PATH_PROJECTS))
    assert problems == []


def test_no_career_is_empty_or_listed_twice_under_a_different_name():
    names = [p["name"].lower() for p in CAREER_PATHS]
    assert len(set(names)) == len(names)
    summaries = {p["summary"].lower() for p in CAREER_PATHS}
    assert len(summaries) == len(CAREER_PATHS)


def test_every_career_page_is_complete():
    for slug, p in BY_SLUG.items():
        for field in ("name", "summary", "beginner_summary", "who_its_for", "earning_notes", "icon"):
            assert p[field].strip(), f"{slug}.{field}"
        assert len(p["entry_roles"]) >= 2 or slug == "full-stack-development", slug
        assert len(p["tools"]) >= 3, slug
        assert len(p["skills_required"]) >= 4, slug
        assert len(p["keywords"]) >= 5, slug
        assert len(p["interview_prep"]) >= 4, slug
        assert len(p["learning_resources"]) >= 2, slug
        assert len(p["portfolio_expectations"]) >= 3, slug
        assert len(p["career_progression"]) >= 4, slug
        assert set(p["roadmap_outline"]) == {"beginner", "intermediate", "advanced"}, slug
        assert all(len(v) >= 3 for v in p["roadmap_outline"].values()), slug


# --- relationships ----------------------------------------------------------


def test_related_careers_exist_are_mutual_and_never_self():
    for slug, p in BY_SLUG.items():
        assert len(p["related_slugs"]) >= 2, slug
        assert slug not in p["related_slugs"]
        assert len(set(p["related_slugs"])) == len(p["related_slugs"])
        for other in p["related_slugs"]:
            assert other in BY_SLUG, f"{slug} -> {other}"
            assert slug in BY_SLUG[other]["related_slugs"], f"{slug} -> {other} is not mutual"


def test_every_category_links_out_to_careers_in_other_categories():
    for category in CATEGORY_SLUGS:
        outward = {BY_SLUG[o]["category"] for p in CAREER_PATHS if p["category"] == category for o in p["related_slugs"]} - {category}
        assert outward, f"{category} careers never point anywhere else"


def test_the_documented_relationships_exist():
    assert {"cloud-security", "security-operations", "penetration-testing"} <= set(BY_SLUG["cybersecurity"]["related_slugs"])
    assert {"frontend-development", "backend-engineering", "full-stack-development"} <= set(BY_SLUG["software-engineering"]["related_slugs"])
    assert {"data-science", "data-engineering"} <= set(BY_SLUG["data-analysis"]["related_slugs"])


# --- no fake distinctions ---------------------------------------------------


def test_no_two_careers_share_a_roadmap_or_nearly_the_same_skills():
    for a, b in itertools.combinations(CAREER_PATHS, 2):
        assert a["roadmap_outline"] != b["roadmap_outline"], (a["slug"], b["slug"])
        skills_a = {s.lower() for s in a["skills_required"]}
        skills_b = {s.lower() for s in b["skills_required"]}
        assert skills_a != skills_b, (a["slug"], b["slug"])
        shared_steps = {
            step for tier in a["roadmap_outline"].values() for step in tier
        } & {step for tier in b["roadmap_outline"].values() for step in tier}
        assert len(shared_steps) <= 1, (a["slug"], b["slug"], shared_steps)


def test_no_two_careers_share_project_titles_or_the_same_project_mix():
    seen: dict[str, str] = {}
    for slug, content in PATH_PROJECTS.items():
        titles = [proj["title"] for phase in content["phases"] for proj in phase["projects"]]
        assert titles, slug
        for title in titles:
            assert title not in seen, f"'{title}' appears in {seen[title]} and {slug}"
            seen[title] = slug


def test_every_career_has_a_project_catalogue_at_each_level():
    assert set(PATH_PROJECTS) == set(BY_SLUG) - FULL_CURRICULUM_SLUGS
    for slug, content in PATH_PROJECTS.items():
        difficulties = {proj["difficulty"] for phase in content["phases"] for proj in phase["projects"]}
        assert {1, 3, 5} <= difficulties, slug
        skill_keys = {s["key"] for s in content["skills"]}
        for phase in content["phases"]:
            assert phase["skill_key"] in skill_keys, (slug, phase["title"])
        for a, b in content["skill_edges"]:
            assert a in skill_keys and b in skill_keys


def test_overlapping_careers_are_distinguished_by_their_projects():
    def project_words(slug: str) -> set[str]:
        return _words(" ".join(proj["title"] + " " + proj["teaches"] for ph in PATH_PROJECTS[slug]["phases"] for proj in ph["projects"]))

    # CI/CD pipelines belong to DevOps; cloud engineering builds the platform itself.
    cloud_titles = " ".join(proj["title"] for ph in PATH_PROJECTS["cloud-engineering"]["phases"] for proj in ph["projects"]).lower()
    assert "ci/cd" not in cloud_titles
    # Design systems belong to product design; accessibility belongs to UI/UX.
    ux_titles = " ".join(proj["title"] for ph in PATH_PROJECTS["ui-ux-design"]["phases"] for proj in ph["projects"]).lower()
    pd_titles = " ".join(proj["title"] for ph in PATH_PROJECTS["product-design"]["phases"] for proj in ph["projects"]).lower()
    assert "design system" not in ux_titles and "design system" in pd_titles
    assert "accessib" in ux_titles or "wcag" in ux_titles
    assert "usability test" not in pd_titles
    # LLM work lives in AI Engineering only.
    ai_titles = " ".join(proj["title"] for ph in PATH_PROJECTS["ai-engineering"]["phases"] for proj in ph["projects"]).lower()
    assert "llm" in ai_titles and "retrieval" in ai_titles
    assert len(project_words("data-analysis") & project_words("data-science")) < 0.4 * len(project_words("data-science"))


# --- search coverage --------------------------------------------------------


def _searchable(path: dict) -> str:
    return " ".join(path["tools"] + path["skills_required"] + path["keywords"] + path["entry_roles"] + [path["name"]]).lower()


@pytest.mark.parametrize(
    "term,expected",
    [
        ("aws", {"cloud-engineering", "cloud-security", "devops-engineering", "solutions-architecture"}),
        ("python", {"software-engineering", "backend-engineering", "data-engineering", "data-science", "ai-engineering", "cybersecurity"}),
        ("figma", {"ui-ux-design", "product-design", "graphic-design"}),
        ("flutter", {"mobile-development"}),
        ("siem", {"security-operations", "detection-engineering"}),
        ("terraform", {"cloud-engineering", "devops-engineering"}),
        ("iam", {"identity-access-management", "cloud-security"}),
        ("kubernetes", {"devops-engineering", "platform-engineering", "site-reliability-engineering"}),
        ("dbt", {"analytics-engineering", "data-engineering"}),
        ("zapier", {"workflow-automation"}),
        ("bubble", {"no-code-development"}),
    ],
)
def test_example_searches_reach_the_expected_careers(term, expected):
    hits = {p["slug"] for p in CAREER_PATHS if re.search(rf"\b{term}\b", _searchable(p))}
    assert expected <= hits


def test_aws_is_a_listed_tool_not_just_a_stray_mention():
    for slug in ("cloud-engineering", "cloud-security", "devops-engineering", "solutions-architecture"):
        assert "AWS" in BY_SLUG[slug]["tools"], slug


# --- legacy slugs and onboarding --------------------------------------------


def test_legacy_slugs_redirect_to_real_careers_and_are_no_longer_careers():
    for old, new in LEGACY_SLUG_REDIRECTS.items():
        assert new in BY_SLUG, old
        assert old not in BY_SLUG, old
        assert canonical_slug(old) == new
    assert canonical_slug("cybersecurity") == "cybersecurity"


def test_every_career_has_a_beginner_explainer():
    assert set(BY_SLUG) <= set(_BEGINNER_EXPLAINERS)
    assert not set(_BEGINNER_EXPLAINERS) - set(BY_SLUG)


def test_wild_card_comes_from_a_different_category_than_the_first_two():
    catalogue = [{"slug": p["slug"], "category": p["category"], "name": p["name"]} for p in CAREER_PATHS]
    traits = ["enjoys_problem_solving", "enjoys_math", "prefers_systems", "enjoys_creativity", "enjoys_people", "risk_tolerant"]
    for mask in range(1 << len(traits)):
        profile = {t: bool(mask >> i & 1) for i, t in enumerate(traits)}
        picks = _pick_top_three(_score_paths(profile, catalogue))
        assert len({p["slug"] for p, _ in picks}) == 3
        first_two = {picks[0][0]["category"], picks[1][0]["category"]}
        assert picks[2][0]["category"] not in first_two, (profile, [p["slug"] for p, _ in picks])


# --- frontend parity --------------------------------------------------------


def test_frontend_taxonomy_matches_the_backend():
    source = (REPO_ROOT / "frontend" / "src" / "lib" / "career-categories.ts").read_text(encoding="utf-8")
    categories = re.findall(r'\{\s*slug: "([a-z-]+)",\s*name: "([^"]+)",\s*blurb: "[^"]+",\s*paths: \[(.*?)\],\s*\}', source, flags=re.S)
    assert [(slug, name) for slug, name, _ in categories] == [(slug, label) for slug, label, _blurb in CATEGORIES]
    for slug, _name, body in categories:
        entries = re.findall(r'slug: "([a-z-]+)", name: "([^"]+)"', body)
        expected = [(p["slug"], p["name"]) for p in CAREER_PATHS if p["category"] == slug]
        assert entries == expected, slug

    legacy = dict(re.findall(r'"?([a-z-]+)"?: "([a-z-]+)",', source.split("LEGACY_CAREER_SLUGS")[1].split("};")[0]))
    assert legacy == LEGACY_SLUG_REDIRECTS


def test_next_config_redirects_match_the_legacy_slug_map():
    config = (REPO_ROOT / "frontend" / "next.config.mjs").read_text(encoding="utf-8")
    block = config.split("const LEGACY_CAREER_SLUGS = {")[1].split("};")[0]
    assert dict(re.findall(r'"?([a-z-]+)"?: "([a-z-]+)",', block)) == LEGACY_SLUG_REDIRECTS


def test_frontend_search_snapshot_is_current():
    assert export_catalogue.SNAPSHOT_PATH.read_text(encoding="utf-8") == export_catalogue.render(), (
        "Run `python -m app.seed.export_catalogue` to refresh frontend/tests/fixtures/catalogue.json"
    )
    assert [c["slug"] for c in json.loads(export_catalogue.render())] == CATALOGUE_ORDER


# --- seeding, redirects and safe syncs --------------------------------------


async def _seed_all():
    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        return {slug: path.id for slug, path in paths.items()}


@pytest.mark.asyncio
async def test_api_lists_the_catalogue_with_categories_and_serves_legacy_urls(client):
    await _seed_all()

    listing = (await client.get("/api/v1/careers")).json()
    assert len(listing) == 48
    by_slug = {c["slug"]: c for c in listing}
    assert by_slug["cybersecurity"]["category"] == "security"
    assert by_slug["cybersecurity"]["category_label"] == "Cybersecurity"
    assert by_slug["cloud-engineering"]["category_label"] == "Cloud, Infrastructure & DevOps"
    assert by_slug["technical-writing"]["category_label"] == "IT, Automation & Technical Communication"
    assert by_slug["cybersecurity"]["related_slugs"]

    for old, new in LEGACY_SLUG_REDIRECTS.items():
        detail = await client.get(f"/api/v1/careers/{old}")
        assert detail.status_code == 200
        assert detail.json()["slug"] == new
    old_projects = await client.get("/api/v1/careers/soc-analysis/projects")
    assert old_projects.status_code == 200 and len(old_projects.json()) == 3
    assert (await client.get("/api/v1/careers/not-a-career")).status_code == 404


@pytest.mark.asyncio
async def test_every_career_has_projects_in_the_catalog_endpoint(client):
    await _seed_all()
    catalog = (await client.get("/api/v1/careers/projects/catalog")).json()
    assert {e["path"]["slug"] for e in catalog} == set(BY_SLUG)


@pytest.mark.asyncio
async def test_legacy_rows_are_renamed_in_place_keeping_their_ids():
    async with AsyncSessionLocal() as db:
        legacy = CareerPath(
            slug="soc-analysis", name="SOC Analysis", summary="old", beginner_summary="", difficulty=2,
            avg_timeline_weeks=20, entry_roles=[], tools=[], remote_potential=60, earning_notes="", icon="monitor",
        )
        db.add(legacy)
        await db.commit()
        legacy_id = legacy.id

        paths = await seed_career_paths(db)
        assert "soc-analysis" not in paths
        renamed = paths["security-operations"]
        assert renamed.id == legacy_id
        assert renamed.name == "Security Operations (SOC Analyst)"
        assert renamed.category == "security"
        assert len(paths) == 48


@pytest.mark.asyncio
async def test_catalogue_sync_updates_content_but_keeps_referenced_projects():
    ids = await _seed_all()
    path_id = ids["cloud-engineering"]
    async with AsyncSessionLocal() as db:
        users = await seed_users(db)
        phase = (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path_id, RoadmapPhase.title == "Advanced Practice"))).scalar_one()

        orphan = Project(phase_id=phase.id, order_index=5, title="Retired project nobody touched", teaches="x", prerequisites=[], expected_output="x", steps=[], hints=[], common_mistakes=[], difficulty=5)
        referenced = Project(phase_id=phase.id, order_index=6, title="Retired project with progress", teaches="x", prerequisites=[], expected_output="x", steps=[], hints=[], common_mistakes=[], difficulty=5)
        db.add_all([orphan, referenced])
        await db.flush()
        db.add(UserProgress(user_id=users["demo@careerfound.dev"].id, project_id=referenced.id, status=ProgressStatus.completed))
        # A stale name from before the sync, to prove content is refreshed.
        path = (await db.execute(select(CareerPath).where(CareerPath.slug == "cloud-engineering"))).scalar_one()
        path.summary = "stale summary"
        await db.commit()

        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)

        titles = {p.title for p in (await db.execute(select(Project).where(Project.phase_id == phase.id))).scalars().all()}
        assert "Retired project nobody touched" not in titles
        assert "Retired project with progress" in titles
        assert any("highly available" in t for t in titles)

        refreshed = (await db.execute(select(CareerPath).where(CareerPath.slug == "cloud-engineering"))).scalar_one()
        assert refreshed.summary == BY_SLUG["cloud-engineering"]["summary"]

        # Running the sync again changes nothing (idempotent).
        before = len((await db.execute(select(Project))).scalars().all())
        await seed_roadmap_content(db, await seed_career_paths(db))
        assert len((await db.execute(select(Project))).scalars().all()) == before


@pytest.mark.asyncio
async def test_mentor_tags_with_legacy_slugs_are_rewritten():
    async with AsyncSessionLocal() as db:
        db.add(Mentor(display_name="Tag Test", headline="h", bio="b", avatar_seed="tag", paths=["devops", "soc-analysis", "devops-engineering", "mobile-development"], hourly_rate_cents=0))
        await db.commit()
        await normalize_mentor_tags(db)
        mentor = (await db.execute(select(Mentor).where(Mentor.display_name == "Tag Test"))).scalar_one()
        assert mentor.paths == ["devops-engineering", "security-operations", "mobile-development"]


@pytest.mark.asyncio
async def test_mentor_filter_accepts_old_and_new_slugs(client):
    async with AsyncSessionLocal() as db:
        db.add(Mentor(display_name="Pipeline Pro", headline="h", bio="b", avatar_seed="pp", paths=["devops-engineering"], hourly_rate_cents=0, is_active=True, is_verified=True, is_demo=False))
        await db.commit()
    for slug in ("devops-engineering", "devops"):
        listing = await client.get("/api/v1/mentors", params={"path": slug})
        assert listing.status_code == 200
        assert any(m["display_name"] == "Pipeline Pro" for m in listing.json()), slug


# --- retargeting a career without losing anyone's progress -------------------


@pytest.mark.asyncio
async def test_no_code_automation_row_becomes_workflow_automation_keeping_its_id_and_progress():
    ids = await _seed_all()
    async with AsyncSessionLocal() as db:
        users = await seed_users(db)
        row = (await db.execute(select(CareerPath).where(CareerPath.slug == "workflow-automation"))).scalar_one()
        # Put the row back the way an older database has it.
        row.slug, row.name = "no-code-automation", "No-Code / Automation"
        project = (await db.execute(
            select(Project).join(RoadmapPhase, Project.phase_id == RoadmapPhase.id)
            .where(RoadmapPhase.path_id == row.id).order_by(Project.difficulty)
        )).scalars().first()
        db.add(UserProgress(user_id=users["demo@careerfound.dev"].id, project_id=project.id, status=ProgressStatus.completed))
        await db.commit()
        old_id, project_id = row.id, project.id

        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        assert "no-code-automation" not in paths
        assert paths["workflow-automation"].id == old_id == ids["workflow-automation"]
        assert paths["workflow-automation"].name == "Workflow Automation"
        progress = (await db.execute(select(UserProgress).where(UserProgress.project_id == project_id))).scalars().all()
        assert len(progress) == 1


@pytest.mark.asyncio
async def test_retargeting_moves_a_used_project_and_drops_unused_skills_phases_and_projects():
    """Simulates the old AI Engineering roadmap (ML projects, a fourth phase, numerical-computing skills)."""
    await _seed_all()
    async with AsyncSessionLocal() as db:
        users = await seed_users(db)
        path = (await db.execute(select(CareerPath).where(CareerPath.slug == "ai-engineering"))).scalar_one()
        phases = {p.title: p for p in (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id))).scalars().all()}
        old_phase = RoadmapPhase(path_id=path.id, order_index=3, title="Building with LLMs", summary="old", unlocks_at_skill_pct=0)
        db.add(old_phase)
        await db.flush()
        used = (await db.execute(select(Project).where(Project.phase_id == phases["Advanced Practice"].id))).scalars().one()
        used.phase_id = old_phase.id  # the retrieval project used to live in the fourth phase
        unused = Project(phase_id=phases["Foundations"].id, order_index=5, title="Linear regression from scratch", teaches="x",
                         prerequisites=[], expected_output="x", steps=[], hints=[], common_mistakes=[], difficulty=1)
        from app.models.roadmap import SkillNode
        stale_skill = SkillNode(path_id=path.id, key="python_numerical_computing", label="Old skill", category="foundation")
        db.add_all([unused, stale_skill])
        await db.flush()
        db.add(UserProgress(user_id=users["demo@careerfound.dev"].id, project_id=used.id, status=ProgressStatus.in_progress))
        await db.commit()
        used_id, advanced_id, path_id = used.id, phases["Advanced Practice"].id, path.id

        await seed_roadmap_content(db, await seed_career_paths(db))
        db.expire_all()

        phase_titles = {p.title for p in (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path_id))).scalars().all()}
        assert phase_titles == {"Foundations", "Building Real Skills", "Advanced Practice"}
        moved = (await db.execute(select(Project).where(Project.id == used_id))).scalar_one()
        assert moved.phase_id == advanced_id
        titles = {p.title for p in (await db.execute(
            select(Project).join(RoadmapPhase, Project.phase_id == RoadmapPhase.id).where(RoadmapPhase.path_id == path_id)
        )).scalars().all()}
        assert "Linear regression from scratch" not in titles
        assert len(titles) == 3
        keys = {n.key for n in (await db.execute(select(SkillNode).where(SkillNode.path_id == path_id))).scalars().all()}
        assert "python_numerical_computing" not in keys and len(keys) == 6


@pytest.mark.asyncio
async def test_seeding_twice_changes_nothing_and_every_career_has_a_roadmap():
    await _seed_all()
    async with AsyncSessionLocal() as db:
        from sqlalchemy import func

        async def counts():
            return [(await db.execute(select(func.count()).select_from(m))).scalar_one() for m in (CareerPath, RoadmapPhase, Project)]

        first = await counts()
        await seed_roadmap_content(db, await seed_career_paths(db))
        assert await counts() == first
        assert first[0] == 48
        empty = (await db.execute(
            select(CareerPath.slug).where(~CareerPath.id.in_(select(RoadmapPhase.path_id)))
        )).scalars().all()
        assert empty == []


# --- the assessment still works across the whole catalogue -------------------


def test_the_assessment_can_recommend_every_career_and_never_an_unknown_one():
    from app.ai.assessment_signals import INTERESTS, PROBLEM_STYLES, STRENGTHS, TECH_INTERESTS

    catalogue = [{"slug": p["slug"], "category": p["category"], "name": p["name"]} for p in CAREER_PATHS]
    for table in (INTERESTS, STRENGTHS, TECH_INTERESTS, PROBLEM_STYLES):
        for tag, (_label, boosts) in table.items():
            assert set(boosts) <= set(BY_SLUG), (tag, set(boosts) - set(BY_SLUG))

    # Every career must be reachable: some honest set of answers (its own tags
    # and traits, optionally the matching category) lands it in the top three.
    tables = (
        ("things_enjoyed", INTERESTS),
        ("existing_skills", STRENGTHS),
        ("tech_interests", TECH_INTERESTS),
        ("problem_styles", PROBLEM_STYLES),
    )
    unreachable = []
    for slug, career in BY_SLUG.items():
        ranked = {key: [t for _, t in sorted(((v[1].get(slug, 0), t) for t, v in table.items() if v[1].get(slug, 0) >= 3), reverse=True)]
                  for key, table in tables}
        found = False
        for counts in itertools.product((1, 3), repeat=4):
            for traits in (list(_TRAIT_WEIGHTS[slug]), []):
                for with_category in (True, False):
                    profile = {t: True for t in traits}
                    for (key, _table), k in zip(tables, counts):
                        profile[key] = ranked[key][:k]
                    if with_category:
                        profile["preferred_category"] = career["category"]
                    picks = _pick_top_three(_score_paths(profile, catalogue))
                    assert len({p["slug"] for p, _ in picks}) == 3 and {p["slug"] for p, _ in picks} <= set(BY_SLUG)
                    found = found or slug in {p["slug"] for p, _ in picks}
        if not found:
            unreachable.append(slug)
    assert unreachable == []


def test_displayed_fit_scores_keep_the_ranking_order():
    catalogue = [{"slug": p["slug"], "category": p["category"], "name": p["name"]} for p in CAREER_PATHS]
    profile = {t: True for t in _TRAIT_WEIGHTS["cybersecurity"]} | {"things_enjoyed": ["security", "puzzles"], "tech_interests": ["security"]}
    scores = [score for _path, score in _score_paths(profile, catalogue)]
    assert scores == sorted(scores, reverse=True)
    assert len(set(scores[:3])) == 3
    assert all(0 <= s <= 100 for s in scores)
