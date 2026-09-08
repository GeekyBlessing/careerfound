"""add career directory depth fields

Revision ID: f3a7c1d92e40
Revises: 730f115b2f38
Create Date: 2026-09-08 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f3a7c1d92e40'
down_revision: Union[str, None] = '730f115b2f38'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# (column_name, server_default) — JSON columns default to an empty list or
# object at the DB level so existing rows never end up NULL; the real
# content itself is backfilled by re-running the career_paths seed, not by
# this migration (matches how career_paths.py already seeds everything
# else, this just makes room for it).
NEW_LIST_COLUMNS = ("skills_required", "certifications", "interview_prep", "learning_resources")
NEW_DICT_COLUMNS = ("roadmap_outline",)


def upgrade() -> None:
    # Guarded the same way as the mentor-service-pricing-labels migration,
    # so a retried/partial run (Render's deploy hook can partially apply
    # migrations on a failed deploy) can't fail on a column that already
    # exists.
    bind = op.get_bind()
    existing_columns = {c['name'] for c in sa.inspect(bind).get_columns('career_paths')}

    for column_name in NEW_LIST_COLUMNS:
        if column_name not in existing_columns:
            op.add_column(
                'career_paths',
                sa.Column(column_name, sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
            )
    for column_name in NEW_DICT_COLUMNS:
        if column_name not in existing_columns:
            op.add_column(
                'career_paths',
                sa.Column(column_name, sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
            )


def downgrade() -> None:
    for column_name in reversed(NEW_DICT_COLUMNS + NEW_LIST_COLUMNS):
        op.drop_column('career_paths', column_name)
