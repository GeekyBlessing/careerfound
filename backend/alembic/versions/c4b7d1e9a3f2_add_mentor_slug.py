"""add mentor slug

Revision ID: c4b7d1e9a3f2
Revises: a9d24f6b7c31
Create Date: 2026-09-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c4b7d1e9a3f2'
down_revision: Union[str, None] = 'a9d24f6b7c31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Guarded the same way as prior mentor-marketplace migrations, so a
    # retried/partial run can't fail on a column/index that already exists.
    bind = op.get_bind()
    existing_columns = {c['name'] for c in sa.inspect(bind).get_columns('mentors')}

    if 'slug' not in existing_columns:
        op.add_column('mentors', sa.Column('slug', sa.String(length=160), nullable=True))
        op.create_index('ix_mentors_slug', 'mentors', ['slug'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_mentors_slug', table_name='mentors')
    op.drop_column('mentors', 'slug')
