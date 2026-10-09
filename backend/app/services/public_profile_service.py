"""The public portfolio at /u/<username>.

Private until the person turns it on. What it shows is assembled from the
person's own record, and every claim carries the label that says how it is
known: skills with evidence come from finished lessons and projects, skills
they listed are marked self-reported, a project's badge is "Repository
checked" or, only after a named reviewer's approval, "CareerFound Verified
Project". The page never shows an email address or an internal id of the
person, and a profile that is off is indistinguishable from one that does not
exist.
"""

from __future__ import annotations

import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career_profile import PublicProfile
from app.models.portfolio import PortfolioItem
from app.models.roadmap import Project
from app.models.user import User
from app.services import career_profile_service, career_readiness_service, case_study_service, lab_service, skill_gap_analyzer
from app.services.career_profile_service import ProfileError, clean_url
from app.services.career_readiness_service import _active_path
from app.services.verification import BADGE_TITLE, CHECKED_TITLE

USERNAME = re.compile(r"^[a-z0-9](?:[a-z0-9-]{1,28})[a-z0-9]$")
RESERVED = {
    "admin", "administrator", "api", "app", "about", "account", "careerfound", "careers", "community", "consultation", "contact", "dashboard",
    "faq", "help", "how-it-works", "jobs", "login", "logout", "mentor", "mentors", "mentorship", "onboarding", "portfolio", "pricing",
    "privacy", "projects", "readiness", "reviews", "roadmap", "settings", "signup", "skill-gap", "support", "terms", "u", "www", "root",
}
TEXT_LIMITS = {"headline": 140, "bio": 1200, "location": 80}


def _public_badge(ver: dict | None) -> dict | None:
    """Verified only for a verified tier. A project waiting for review, or one
    where changes were requested, still has its automated evidence."""
    if not ver:
        return None
    if ver["tier"] == "verified":
        return ver["badge"]
    if ver["evidence_checked"]:
        return {"title": CHECKED_TITLE, "tier": "evidence_checked"}
    return None


def suggest_username(user: User) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", (user.full_name or "").lower()).strip("-")[:24] or "learner"
    return base if len(base) >= 3 else base + "-cf"


def _validate_username(name: str) -> str:
    name = (name or "").strip().lower()
    if not USERNAME.match(name):
        raise ProfileError("Use 3 to 30 letters, numbers or hyphens, starting and ending with a letter or number.", 422)
    if re.search(r"-{2}", name):
        raise ProfileError("Do not use two hyphens in a row.", 422)
    if name in RESERVED:
        raise ProfileError("That name is reserved. Choose another.", 422)
    return name


def _profile_out(p: PublicProfile | None, user: User) -> dict:
    if p is None:
        return {"exists": False, "suggested_username": suggest_username(user)}
    return {
        "exists": True,
        "username": p.username,
        "headline": p.headline,
        "bio": p.bio,
        "location": p.location,
        "github_url": p.github_url,
        "linkedin_url": p.linkedin_url,
        "website_url": p.website_url,
        "is_public": p.is_public,
        "show_readiness": p.show_readiness,
        "show_skills": p.show_skills,
        "show_certifications": p.show_certifications,
        "path": f"/u/{p.username}",
    }


async def _mine(db: AsyncSession, user_id: uuid.UUID) -> PublicProfile | None:
    return (await db.execute(select(PublicProfile).where(PublicProfile.user_id == user_id))).scalar_one_or_none()


async def get_mine(db: AsyncSession, user: User) -> dict:
    p = await _mine(db, user.id)
    out = _profile_out(p, user)
    published = (await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == user.id, PortfolioItem.is_published.is_(True)))).scalars().all()
    out["published_projects"] = len(published)
    return out


async def save_mine(db: AsyncSession, user: User, payload: dict) -> dict:
    p = await _mine(db, user.id)
    if p is None:
        if "username" not in payload:
            raise ProfileError("Choose a username first.", 422)
        p = PublicProfile(user_id=user.id, username="pending")
        db.add(p)
    if "username" in payload:
        name = _validate_username(payload["username"])
        taken = (await db.execute(select(PublicProfile).where(PublicProfile.username == name, PublicProfile.user_id != user.id))).scalar_one_or_none()
        if taken:
            raise ProfileError("That username is taken.", 409)
        p.username = name
    if p.username == "pending":
        raise ProfileError("Choose a username first.", 422)
    for key, limit in TEXT_LIMITS.items():
        if key in payload:
            value = (payload[key] or "").strip()
            if len(value) > limit:
                raise ProfileError(f"The {key} is longer than {limit} characters.", 422)
            setattr(p, key, value)
    for key in ("github_url", "linkedin_url", "website_url"):
        if key in payload:
            url = clean_url(payload[key] or "", key.replace("_", " "))
            if url and not url.lower().startswith("https://"):
                raise ProfileError("Links on your public page must start with https://", 422)
            setattr(p, key, url)
    for key in ("is_public", "show_readiness", "show_skills", "show_certifications"):
        if key in payload and payload[key] is not None:
            setattr(p, key, bool(payload[key]))
    await db.commit()
    await db.refresh(p)
    return _profile_out(p, user)


async def public_view(db: AsyncSession, username: str) -> dict:
    p = (await db.execute(select(PublicProfile).where(PublicProfile.username == (username or "").lower()))).scalar_one_or_none()
    if p is None or not p.is_public:
        raise ProfileError("Profile not found.", 404)
    user = (await db.execute(select(User).where(User.id == p.user_id))).scalar_one()

    path = await _active_path(db, user.id)
    out: dict = {
        "username": p.username,
        "name": user.full_name,
        "headline": p.headline,
        "bio": p.bio,
        "location": p.location,
        "links": [{"label": l, "url": u} for l, u in (("GitHub", p.github_url), ("LinkedIn", p.linkedin_url), ("Website", p.website_url)) if u],
        "career": {"slug": path.slug, "name": path.name} if path else None,
    }

    # Projects: only published portfolio pieces, each with how it is known.
    items = (
        await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == user.id, PortfolioItem.is_published.is_(True)).order_by(PortfolioItem.created_at.desc()))
    ).scalars().all()
    projects = {x.id: x for x in (await db.execute(select(Project).where(Project.id.in_([i.project_id for i in items])))).scalars().all()} if items else {}
    lab_projects = [projects[i.project_id] for i in items if i.project_id in projects and projects[i.project_id].lab]
    states = await lab_service._states_for_user(db, user.id, lab_projects) if lab_projects else {}
    out_projects = []
    for i in items:
        proj = projects.get(i.project_id)
        ver = states[proj.id]["verification"] if proj and proj.id in states else None
        cs = case_study_service.view(i)
        has_case = any((cs["case_study"].get(k) or "").strip() for k in ("overview", "problem", "solution"))
        out_projects.append(
            {
                "id": i.id,
                "title": i.title,
                "summary": (cs["case_study"]["overview"] or i.project_description or "").strip(),
                "skills": list(i.skills_demonstrated or []),
                "cv_bullet": i.cv_bullet,
                "github": i.repo_url,
                "live_demo": i.live_url,
                "level": proj.level if proj else None,
                "badge": _public_badge(ver),
                "verified_by": ver["reviewer_name"] if ver and ver["tier"] == "verified" else "",
                "verified_on": ver["reviewed_at"] if ver and ver["tier"] == "verified" else None,
                "case_study": cs["case_study"] if has_case else None,
            }
        )
    out["projects"] = out_projects

    verified = sum(1 for x in out_projects if x["badge"] and x["badge"]["tier"] == "verified")
    checked = sum(1 for x in out_projects if x["badge"] and x["badge"]["tier"] == "evidence_checked")
    out["achievements"] = [
        a
        for a in (
            {"label": "Projects published", "value": len(out_projects)} if out_projects else None,
            {"label": "CareerFound Verified projects", "value": verified} if verified else None,
            {"label": "Repositories checked", "value": checked + verified} if (checked + verified) else None,
        )
        if a
    ]

    if path and p.show_skills:
        analysis = await skill_gap_analyzer.analyse(db, user, path)
        out["skills"] = {
            "with_evidence": [{"label": s["label"], "status": s["status_label"]} for s in analysis["skills"] if s["status"] != "missing"],
            "self_reported": [s.name for s in await career_profile_service.list_skills(db, user.id)],
        }
    elif p.show_skills:
        out["skills"] = {"with_evidence": [], "self_reported": [s.name for s in await career_profile_service.list_skills(db, user.id)]}
    else:
        out["skills"] = None

    if p.show_certifications:
        out["certifications"] = [
            {"name": c.name, "issuer": c.issuer, "status": c.status, "year": c.year, "credential_url": c.credential_url}
            for c in await career_profile_service.list_certifications(db, user.id)
        ]
    else:
        out["certifications"] = None

    if p.show_readiness and path:
        r = await career_readiness_service.compute(db, user)
        out["readiness"] = (
            {
                "score": r["score"],
                "band": r["band"],
                "signals": [{"label": s["label"], "pct": s["pct"]} for s in r["signals"] if s["available"]],
            }
            if r["has_activity"]
            else None
        )
    else:
        out["readiness"] = None

    out["labels"] = {
        "verified": BADGE_TITLE,
        "checked": CHECKED_TITLE,
        "note": (
            f"\"{BADGE_TITLE}\" means a named CareerFound reviewer read the project and approved the repository. "
            f"\"{CHECKED_TITLE}\" means only that an automated check found a public repository with a README and a real commit history. "
            "Skills listed as self-reported and certifications are stated by the learner and not checked by CareerFound."
        ),
    }
    return out


async def cv_markdown(db: AsyncSession, user: User) -> str:
    """A plain text projects and skills section for a CV. The verified marker
    appears only on a project a reviewer has approved."""
    items = (
        await db.execute(select(PortfolioItem).where(PortfolioItem.user_id == user.id, PortfolioItem.is_published.is_(True)).order_by(PortfolioItem.created_at.desc()))
    ).scalars().all()
    projects = {x.id: x for x in (await db.execute(select(Project).where(Project.id.in_([i.project_id for i in items])))).scalars().all()} if items else {}
    lab_projects = [projects[i.project_id] for i in items if i.project_id in projects and projects[i.project_id].lab]
    states = await lab_service._states_for_user(db, user.id, lab_projects) if lab_projects else {}
    lines = [f"# {user.full_name}", ""]
    p = await _mine(db, user.id)
    if p and p.headline:
        lines += [p.headline, ""]
    lines += ["## Projects", ""]
    if not items:
        lines.append("No published projects yet.")
    for i in items:
        proj = projects.get(i.project_id)
        ver = states[proj.id]["verification"] if proj and proj.id in states else None
        mark = f" ({BADGE_TITLE})" if ver and ver["tier"] == "verified" else ""
        lines.append(f"### {i.title}{mark}")
        if i.cv_bullet:
            lines.append(f"- {i.cv_bullet}")
        if i.skills_demonstrated:
            lines.append("- Skills: " + ", ".join(i.skills_demonstrated))
        if i.repo_url:
            lines.append(f"- Repository: {i.repo_url}")
        if i.live_url:
            lines.append(f"- Live: {i.live_url}")
        lines.append("")
    skills = await career_profile_service.list_skills(db, user.id)
    if skills:
        lines += ["## Skills", "", ", ".join(s.name for s in skills), ""]
    certs = await career_profile_service.list_certifications(db, user.id)
    if certs:
        lines += ["## Certifications", ""]
        for c in certs:
            tail = " (in progress)" if c.status == "in_progress" else (f", {c.year}" if c.year else "")
            lines.append(f"- {c.name}" + (f", {c.issuer}" if c.issuer else "") + tail)
        lines.append("")
    return "\n".join(lines).strip() + "\n"
