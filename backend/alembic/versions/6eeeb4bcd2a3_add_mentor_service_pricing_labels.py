"""add mentor service pricing labels

Revision ID: 6eeeb4bcd2a3
Revises: ab1589948938
Create Date: 2026-08-24 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '6eeeb4bcd2a3'
down_revision: Union[str, None] = 'ab1589948938'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


NEW_COLUMNS = (
    "mentorship_duration_label",
    "mentorship_price_label",
    "consultation_duration_label",
    "consultation_price_label",
)

OLD_AVAILABILITY_DEFAULT = "Availability coming soon — check back or ask a question."
NEW_AVAILABILITY_DEFAULT = "Availability coming soon: check back or ask a question."


def upgrade() -> None:
    # Guarded the same way as the prior mentor-marketplace migration, so a
    # retried/partial run can't fail on a column that already exists.
    bind = op.get_bind()
    existing_columns = {c['name'] for c in sa.inspect(bind).get_columns('mentors')}

    for column_name in NEW_COLUMNS:
        if column_name not in existing_columns:
            op.add_column('mentors', sa.Column(column_name, sa.String(length=80), nullable=False, server_default=sa.text("''")))

    # Fix the one-time em dash in the availability_note column default at
    # the DB level too, matching the Python model default fix. This only
    # changes what NEW rows get when no explicit value is given; existing
    # rows are fixed by the data backfill in seed_data.py.
    op.alter_column(
        'mentors',
        'availability_note',
        server_default=sa.text(f"'{NEW_AVAILABILITY_DEFAULT}'"),
    )

    # Data fix: any existing row still holding the exact old em dash default
    # gets the corrected text. Scoped to an exact match so a mentor's own
    # customized note is never touched.
    mentors_table = sa.table(
        'mentors',
        sa.column('availability_note', sa.Text()),
    )
    op.execute(
        mentors_table.update()
        .where(mentors_table.c.availability_note == OLD_AVAILABILITY_DEFAULT)
        .values(availability_note=NEW_AVAILABILITY_DEFAULT)
    )


def downgrade() -> None:
    op.alter_column(
        'mentors',
        'availability_note',
        server_default=sa.text(f"'{OLD_AVAILABILITY_DEFAULT}'"),
    )
    for column_name in reversed(NEW_COLUMNS):
        op.drop_column('mentors', column_name)
