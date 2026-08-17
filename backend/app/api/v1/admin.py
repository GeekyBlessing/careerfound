from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.admin import AdminOverviewOut
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/metrics/overview", response_model=AdminOverviewOut)
async def metrics_overview(_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    return await admin_service.get_overview(db)


@router.get("/users")
async def list_users(_admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(200))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "plan": u.plan.value,
            "role": u.role.value,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]
