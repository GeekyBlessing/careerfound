"""add service_requests table

Revision ID: a9d24f6b7c31
Revises: f3a7c1d92e40
Create Date: 2026-09-08 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from app.db.base import GUID


revision: str = 'a9d24f6b7c31'
down_revision: Union[str, None] = 'f3a7c1d92e40'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if 'service_requests' in sa.inspect(bind).get_table_names():
        return

    # Use the Postgres-native postgresql.ENUM with create_type=False, not
    # the generic sa.Enum — the generic wrapper doesn't reliably propagate
    # create_type to the Postgres dialect impl it adapts into, so
    # op.create_table below still emits its own CREATE TYPE for this
    # column and collides with the type this migration just created
    # explicitly two lines up, failing every single run with "type
    # already exists" — not just on a partially applied database. Same
    # pattern as applicationstatus in
    # ab1589948938_add_mentor_marketplace_v2_tables_and_.py.
    service_request_type = postgresql.ENUM(
        'mentorship', 'consultation', name='servicerequesttype', create_type=False
    )
    service_request_type.create(bind, checkfirst=True)

    op.create_table(
        'service_requests',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column('name', sa.String(length=160), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('service', service_request_type, nullable=False, server_default='consultation'),
        sa.Column('message', sa.Text(), nullable=False, server_default=''),
    )
    op.create_index('ix_service_requests_email', 'service_requests', ['email'])


def downgrade() -> None:
    op.drop_index('ix_service_requests_email', table_name='service_requests')
    op.drop_table('service_requests')
    postgresql.ENUM(name='servicerequesttype').drop(op.get_bind(), checkfirst=True)
