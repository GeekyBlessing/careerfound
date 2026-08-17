import hashlib
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog


async def log_action(
    db: AsyncSession,
    *,
    user_id: uuid.UUID | None,
    action: str,
    resource_type: str = "",
    resource_id: str = "",
    ip: str = "",
) -> None:
    ip_hash = hashlib.sha256(ip.encode()).hexdigest() if ip else ""
    db.add(
        AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_hash=ip_hash,
        )
    )
    await db.commit()
