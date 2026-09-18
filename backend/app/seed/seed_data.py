"""
Idempotent seed script. Run with:

    python -m app.seed.seed_data

Populates:
- The full 21-path career catalog
- Two fully-authored roadmaps (Cybersecurity, Software Engineering) with
  phases, lessons, exercises, projects, quizzes, and a skill dependency graph
- Real-world simulation scenarios
- Mentor marketplace listings
- One community per career path with a few realistic seed posts
- Three demo users: a brand-new user, a mid-progress user, and an admin
"""
import asyncio
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
from app.models.career import CareerPath
from app.models.community import Community, CommunityPost
from app.models.marketplace import Mentor
from app.models.progress import (
    DailyMission,
    ProgressStatus,
    ReadinessScore,
    Simulation,
    Streak,
    UserProgress,
    UserSkillProgress,
    XPEvent,
)
from app.models.roadmap import Exercise, Lesson, Project, Quiz, Roadmap, RoadmapPhase, RoadmapStatus, SkillEdge, SkillNode
from app.models.user import Plan, Role, User
from app.seed.career_paths import CAREER_PATHS
from app.seed.mentors import FOUNDING_MENTOR, MENTORS, MOBILE_ENGINEERING_MENTOR
from app.seed.roadmap_content import CYBERSECURITY, SOFTWARE_ENGINEERING
from app.seed.roadmap_content_extra import PATH_PROJECTS
from app.seed.simulations import SIMULATIONS

ROADMAP_CONTENT = {
    "cybersecurity": CYBERSECURITY,
    "software-engineering": SOFTWARE_ENGINEERING,
    # The remaining 19 paths get a lighter but fully real "project catalog"
    # (Beginner / Intermediate / Expert projects) rather than a full
    # lesson/quiz curriculum — see roadmap_content_extra.py and
    # docs/PHASE_2.md item #5 for the plan to expand these to full roadmaps.
    **PATH_PROJECTS,
}


# Directory-depth fields added to CareerPath after the 21 paths were
# already seeded in production (see f3a7c1d92e40_add_career_directory_depth_fields).
# Rows created before that migration exist in `existing` below and get
# skipped entirely by the "already seeded" check, so without this list
# they'd keep their empty defaults forever. Backfilled from CAREER_PATHS
# only when still empty, so a real admin edit is never overwritten.
CAREER_PATH_DEPTH_FIELDS = [
    "skills_required",
    "certifications",
    "interview_prep",
    "learning_resources",
    "roadmap_outline",
]


async def seed_career_paths(db: AsyncSession) -> dict[str, CareerPath]:
    result = await db.execute(select(CareerPath))
    existing = {p.slug: p for p in result.scalars().all()}
    for data in CAREER_PATHS:
        if data["slug"] in existing:
            path = existing[data["slug"]]
            for field in CAREER_PATH_DEPTH_FIELDS:
                if not getattr(path, field) and data.get(field):
                    setattr(path, field, data[field])
            continue
        path = CareerPath(**data)
        db.add(path)
        existing[data["slug"]] = path
    await db.commit()
    # refresh ids
    result = await db.execute(select(CareerPath))
    return {p.slug: p for p in result.scalars().all()}


async def seed_roadmap_content(db: AsyncSession, paths: dict[str, CareerPath]) -> None:
    for slug, content in ROADMAP_CONTENT.items():
        path = paths[slug]
        existing_nodes = (await db.execute(select(SkillNode).where(SkillNode.path_id == path.id))).scalars().all()
        if existing_nodes:
            continue  # already seeded

        skill_key_to_id: dict[str, uuid.UUID] = {}
        for skill in content["skills"]:
            node = SkillNode(path_id=path.id, key=skill["key"], label=skill["label"], category=skill["category"])
            db.add(node)
            await db.flush()
            skill_key_to_id[skill["key"]] = node.id

        for from_key, to_key in content["skill_edges"]:
            db.add(SkillEdge(path_id=path.id, from_skill_id=skill_key_to_id[from_key], to_skill_id=skill_key_to_id[to_key]))

        for phase_idx, phase_data in enumerate(content["phases"]):
            phase = RoadmapPhase(
                path_id=path.id,
                order_index=phase_idx,
                title=phase_data["title"],
                summary=phase_data["summary"],
                unlocks_at_skill_pct=0,
            )
            db.add(phase)
            await db.flush()

            skill_id = skill_key_to_id.get(phase_data.get("skill_key"))
            lesson_ids = []
            for lesson_idx, lesson_data in enumerate(phase_data.get("lessons", [])):
                lesson = Lesson(
                    phase_id=phase.id,
                    order_index=lesson_idx,
                    title=lesson_data["title"],
                    concept_summary=lesson_data["concept_summary"],
                    beginner_explainer=lesson_data["beginner_explainer"],
                    content_md=lesson_data["content_md"],
                    est_minutes=lesson_data["est_minutes"],
                    skill_node_id=skill_id,
                )
                db.add(lesson)
                await db.flush()
                lesson_ids.append(lesson.id)

            for ex_data in phase_data.get("exercises", []):
                lesson_id = lesson_ids[ex_data["lesson_index"]]
                db.add(
                    Exercise(
                        lesson_id=lesson_id,
                        prompt=ex_data["prompt"],
                        type=ex_data["type"],
                        options=ex_data["options"],
                        answer_key=ex_data["answer_key"],
                        est_minutes=ex_data["est_minutes"],
                    )
                )

            for proj_idx, proj_data in enumerate(phase_data.get("projects", [])):
                db.add(
                    Project(
                        phase_id=phase.id,
                        order_index=proj_idx,
                        title=proj_data["title"],
                        teaches=proj_data["teaches"],
                        prerequisites=proj_data["prerequisites"],
                        expected_output=proj_data["expected_output"],
                        steps=proj_data["steps"],
                        hints=proj_data["hints"],
                        common_mistakes=proj_data["common_mistakes"],
                        difficulty=proj_data["difficulty"],
                        skill_node_id=skill_id,
                    )
                )

            quiz_data = phase_data.get("quiz")
            if quiz_data:
                db.add(
                    Quiz(
                        phase_id=phase.id,
                        title=quiz_data["title"],
                        passing_score=quiz_data["passing_score"],
                        questions=quiz_data["questions"],
                    )
                )

        await db.commit()


async def seed_simulations(db: AsyncSession, paths: dict[str, CareerPath]) -> None:
    existing = (await db.execute(select(Simulation))).scalars().first()
    if existing:
        return
    for slug, sims in SIMULATIONS.items():
        path = paths[slug]
        for sim in sims:
            db.add(
                Simulation(
                    path_id=path.id,
                    title=sim["title"],
                    scenario_md=sim["scenario_md"],
                    options=sim["options"],
                    correct_option=sim["correct_option"],
                    explanation_md=sim["explanation_md"],
                    difficulty=sim["difficulty"],
                )
            )
    await db.commit()


async def seed_mentors(db: AsyncSession) -> None:
    # Demo/fictional marketplace personas — is_demo=True so the UI always
    # labels them "DEMO MENTOR" and never confuses them with real people.
    existing_demo = (await db.execute(select(Mentor).where(Mentor.is_demo.is_(True)))).scalars().first()
    if not existing_demo:
        for m in MENTORS:
            db.add(Mentor(**m, is_verified=True, is_active=True, is_demo=True))
        await db.commit()

    # The one real, founding mentor — kept as a separate idempotency check
    # (keyed on contact_email) so it seeds correctly even on a DB that
    # already has the demo mentors from before this feature existed.
    existing_founder = (
        await db.execute(select(Mentor).where(Mentor.contact_email == FOUNDING_MENTOR["contact_email"]))
    ).scalars().first()
    if not existing_founder:
        db.add(Mentor(**FOUNDING_MENTOR, is_verified=False, is_active=True, is_demo=False, is_founding_mentor=True))
        await db.commit()
    else:
        # Backfill only the newly-added pricing-label fields when they're
        # still blank, e.g. a row seeded before these fields existed. Every
        # other field is intentionally left untouched so a real profile
        # edit made from the mentor dashboard is never overwritten by a
        # later redeploy re-running this seed script.
        changed = False
        for field in (
            "mentorship_duration_label",
            "mentorship_price_label",
            "consultation_duration_label",
            "consultation_price_label",
        ):
            if not getattr(existing_founder, field) and FOUNDING_MENTOR.get(field):
                setattr(existing_founder, field, FOUNDING_MENTOR[field])
                changed = True
        # One-time text fix: an earlier column default used an em dash. Only
        # touch rows that still hold that exact original default, so a
        # mentor-dashboard edit to this field is never overwritten.
        # Built from an escape rather than a literal character so this
        # source file itself contains zero em dashes, while still matching
        # byte-for-byte against any legacy row that has the old value.
        old_default = "Availability coming soon" + chr(0x2014) + " check back or ask a question."
        if existing_founder.availability_note == old_default:
            existing_founder.availability_note = "Availability coming soon: check back or ask a question."
            changed = True
        # One-time positioning update: Toriola's headline/tags were narrowed
        # to cybersecurity/cloud security only. Only touch a row that still
        # holds that exact original headline, so a real dashboard edit is
        # never overwritten.
        old_headline = "Cybersecurity & Cloud Security Engineer | Cybersecurity Mentor"
        if existing_founder.headline == old_headline:
            existing_founder.headline = FOUNDING_MENTOR["headline"]
            existing_founder.paths = FOUNDING_MENTOR["paths"]
            changed = True
        if changed:
            await db.commit()

    # A second real, non-demo mentor (mobile engineering). Keyed on
    # display_name rather than contact_email for idempotency, since no
    # verified email exists yet for this profile.
    existing_mobile_mentor = (
        await db.execute(select(Mentor).where(Mentor.display_name == MOBILE_ENGINEERING_MENTOR["display_name"]))
    ).scalars().first()
    if not existing_mobile_mentor:
        db.add(
            Mentor(
                **MOBILE_ENGINEERING_MENTOR,
                is_verified=False,
                is_active=True,
                is_demo=False,
                is_founding_mentor=True,
            )
        )
        await db.commit()


async def seed_communities(db: AsyncSession, paths: dict[str, CareerPath], demo_user: User) -> None:
    existing = (await db.execute(select(Community))).scalars().first()
    if existing:
        return
    community_defs = {
        "cybersecurity": "Trade SOC war stories, ask 'is this suspicious?' questions, and share your home-lab projects.",
        "software-engineering": "Code reviews, career-switch stories, and 'why is this bug happening' threads.",
        "data-analysis": "Dataset breakdowns, SQL puzzles, and dashboard show-and-tell.",
        "product-design": "Portfolio feedback, Figma tips, and case study critiques.",
        "cloud-engineering": "Cloud cert study groups and architecture questions.",
    }
    communities: dict[str, Community] = {}
    for slug, desc in community_defs.items():
        path = paths[slug]
        community = Community(path_id=path.id, name=f"{path.name} Community", description=desc)
        db.add(community)
        await db.flush()
        communities[slug] = community

    seed_posts = [
        ("cybersecurity", "showcase", "Just finished my port scanner project!", "Took me a weekend but it's fully working with threading now. Huge thanks to the AI mentor for pushing me to add a timeout, my first version hung forever on filtered ports."),
        ("cybersecurity", "question", "How do you tell a real brute-force attempt from a user who just forgot their password?", "I keep going back and forth on Alert B in the SOC simulation. Volume and geography seem like the key signals, anything else you all look at?"),
        ("software-engineering", "discussion", "What's your Git commit message style?", "Trying to build a good habit early. Currently doing 'type: short description' (feat:, fix:, etc), curious what's standard on real teams."),
        ("software-engineering", "showcase", "Deployed my capstone task manager!", "First time deploying anything live. Render's free tier made it pretty painless. Would love feedback on the README."),
    ]
    for slug, kind, title, body in seed_posts:
        db.add(CommunityPost(community_id=communities[slug].id, user_id=demo_user.id, kind=kind, title=title, body=body, upvotes=3))
    await db.commit()


async def seed_users(db: AsyncSession) -> dict[str, User]:
    result = await db.execute(select(User))
    existing = {u.email: u for u in result.scalars().all()}
    users_to_create = [
        dict(email="admin@careerfound.dev", password="AdminPass123!", full_name="CareerFound Admin", role=Role.admin, plan=Plan.pro, beginner_mode=False),
        dict(email="demo@careerfound.dev", password="DemoPass123!", full_name="Amara Chukwu", role=Role.user, plan=Plan.pro, beginner_mode=False, country="Nigeria", persona="switcher", goal="job"),
        dict(email="newuser@careerfound.dev", password="NewUser123!", full_name="Jordan Rivera", role=Role.user, plan=Plan.free, beginner_mode=True, country="United States", persona="student", goal="explore"),
    ]
    for u in users_to_create:
        if u["email"] in existing:
            continue
        password = u.pop("password")
        user = User(password_hash=hash_password(password), **u)
        db.add(user)
        existing[user.email] = user
    await db.commit()
    result = await db.execute(select(User))
    return {u.email: u for u in result.scalars().all()}


async def seed_demo_progress(db: AsyncSession, users: dict[str, User], paths: dict[str, CareerPath]) -> None:
    demo = users["demo@careerfound.dev"]
    existing_roadmap = (await db.execute(select(Roadmap).where(Roadmap.user_id == demo.id))).scalars().first()
    if existing_roadmap:
        return

    path = paths["cybersecurity"]
    roadmap = Roadmap(user_id=demo.id, path_id=path.id, status=RoadmapStatus.active)
    db.add(roadmap)
    await db.flush()

    # Complete the first two phases' lessons/exercises/projects/quizzes for a
    # realistic "mid-progress" dashboard.
    phases = (
        (await db.execute(select(RoadmapPhase).where(RoadmapPhase.path_id == path.id).order_by(RoadmapPhase.order_index)))
        .scalars()
        .all()[:2]
    )
    completed_at = datetime.now(timezone.utc) - timedelta(days=3)
    for phase in phases:
        lessons = (await db.execute(select(Lesson).where(Lesson.phase_id == phase.id))).scalars().all()
        for lesson in lessons:
            db.add(UserProgress(user_id=demo.id, lesson_id=lesson.id, status=ProgressStatus.completed, completed_at=completed_at))
            if lesson.skill_node_id:
                existing_skill = (
                    await db.execute(
                        select(UserSkillProgress).where(
                            UserSkillProgress.user_id == demo.id, UserSkillProgress.skill_node_id == lesson.skill_node_id
                        )
                    )
                ).scalar_one_or_none()
                if existing_skill:
                    existing_skill.mastery_pct = min(100, existing_skill.mastery_pct + 15)
                else:
                    db.add(UserSkillProgress(user_id=demo.id, skill_node_id=lesson.skill_node_id, mastery_pct=40))
            db.add(XPEvent(user_id=demo.id, amount=10, reason=f"Completed lesson: {lesson.title}"))
        projects = (await db.execute(select(Project).where(Project.phase_id == phase.id))).scalars().all()
        for project in projects:
            db.add(UserProgress(user_id=demo.id, project_id=project.id, status=ProgressStatus.completed, completed_at=completed_at))
            db.add(XPEvent(user_id=demo.id, amount=40, reason=f"Completed project: {project.title}"))
        quizzes = (await db.execute(select(Quiz).where(Quiz.phase_id == phase.id))).scalars().all()
        for quiz in quizzes:
            db.add(UserProgress(user_id=demo.id, quiz_id=quiz.id, status=ProgressStatus.completed, score=85.0, completed_at=completed_at))

    db.add(Streak(user_id=demo.id, current_streak_days=6, longest_streak_days=9, last_active_date=date.today()))
    db.add(
        ReadinessScore(
            user_id=demo.id, overall=42, knowledge_pct=55, projects_pct=40, portfolio_pct=25, interview_pct=20, practical_pct=60,
            next_actions=["Ship your next mini-project: projects carry the most weight in your score.", "Generate a portfolio write-up for a completed project."],
        )
    )
    await db.commit()


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        paths = await seed_career_paths(db)
        await seed_roadmap_content(db, paths)
        await seed_simulations(db, paths)
        await seed_mentors(db)
        users = await seed_users(db)
        await seed_communities(db, paths, users["demo@careerfound.dev"])
        await seed_demo_progress(db, users, paths)

    print("Seed complete.")
    print("Demo accounts:")
    print("  admin@careerfound.dev / AdminPass123!  (admin)")
    print("  demo@careerfound.dev  / DemoPass123!   (mid-progress user, Cybersecurity path)")
    print("  newuser@careerfound.dev / NewUser123!  (brand-new user, no roadmap yet)")


if __name__ == "__main__":
    asyncio.run(main())
