"""Self-declared skills and certifications.

These are the person's own statements. They are stored and shown, labelled
self-reported, and deliberately never feed the readiness score or a skill's
status: CareerFound does not check them.
"""

from __future__ import annotations

import re
import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career_profile import UserCertification, UserSkill

SKILL_LEVELS = ("learning", "comfortable", "strong")
CERT_STATUSES = ("earned", "in_progress")
MAX_SKILLS = 40
MAX_CERTS = 20


class ProfileError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message = message
        self.status = status


def clean_url(url: str, field: str = "link") -> str:
    url = (url or "").strip()
    if not url:
        return ""
    if not re.match(r"^https?://[^\s]+$", url, re.IGNORECASE) or len(url) > 300:
        raise ProfileError(f"The {field} must start with http:// or https://", 422)
    return url


def skill_out(s: UserSkill) -> dict:
    return {"id": s.id, "name": s.name, "level": s.level, "self_reported": True}


def cert_out(c: UserCertification) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "issuer": c.issuer,
        "status": c.status,
        "year": c.year,
        "credential_url": c.credential_url,
        "self_reported": True,
    }


async def list_skills(db: AsyncSession, user_id: uuid.UUID) -> list[UserSkill]:
    return list((await db.execute(select(UserSkill).where(UserSkill.user_id == user_id).order_by(UserSkill.name_key))).scalars().all())


async def add_skill(db: AsyncSession, user_id: uuid.UUID, name: str, level: str) -> UserSkill:
    name = re.sub(r"\s+", " ", (name or "").strip())
    if not 2 <= len(name) <= 80:
        raise ProfileError("A skill name needs 2 to 80 characters.", 422)
    if level not in SKILL_LEVELS:
        raise ProfileError("Level must be learning, comfortable or strong.", 422)
    key = name.lower()
    existing = (await db.execute(select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.name_key == key))).scalar_one_or_none()
    if existing:
        existing.level = level
        existing.name = name
        await db.commit()
        return existing
    count = (await db.execute(select(func.count(UserSkill.id)).where(UserSkill.user_id == user_id))).scalar_one()
    if count >= MAX_SKILLS:
        raise ProfileError(f"You can list up to {MAX_SKILLS} skills.", 400)
    skill = UserSkill(user_id=user_id, name=name, name_key=key, level=level)
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill


async def remove_skill(db: AsyncSession, user_id: uuid.UUID, skill_id: uuid.UUID) -> None:
    row = (await db.execute(select(UserSkill).where(UserSkill.id == skill_id, UserSkill.user_id == user_id))).scalar_one_or_none()
    if row is None:
        raise ProfileError("Skill not found.", 404)
    await db.delete(row)
    await db.commit()


async def list_certifications(db: AsyncSession, user_id: uuid.UUID) -> list[UserCertification]:
    return list(
        (await db.execute(select(UserCertification).where(UserCertification.user_id == user_id).order_by(UserCertification.created_at.desc()))).scalars().all()
    )


async def add_certification(db: AsyncSession, user_id: uuid.UUID, name: str, issuer: str, status: str, year: int | None, credential_url: str) -> UserCertification:
    name = re.sub(r"\s+", " ", (name or "").strip())
    if not 2 <= len(name) <= 160:
        raise ProfileError("A certification name needs 2 to 160 characters.", 422)
    if status not in CERT_STATUSES:
        raise ProfileError("Status must be earned or in_progress.", 422)
    if year is not None and not 1990 <= year <= 2100:
        raise ProfileError("That year does not look right.", 422)
    count = (await db.execute(select(func.count(UserCertification.id)).where(UserCertification.user_id == user_id))).scalar_one()
    if count >= MAX_CERTS:
        raise ProfileError(f"You can list up to {MAX_CERTS} certifications.", 400)
    cert = UserCertification(
        user_id=user_id, name=name, issuer=(issuer or "").strip()[:120], status=status, year=year, credential_url=clean_url(credential_url, "credential link")
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return cert


async def remove_certification(db: AsyncSession, user_id: uuid.UUID, cert_id: uuid.UUID) -> None:
    row = (await db.execute(select(UserCertification).where(UserCertification.id == cert_id, UserCertification.user_id == user_id))).scalar_one_or_none()
    if row is None:
        raise ProfileError("Certification not found.", 404)
    await db.delete(row)
    await db.commit()
