"""add email system: verification/preferences on users, email_tokens table

Revision ID: 730f115b2f38
Revises: 6eeeb4bcd2a3
Create Date: 2026-08-24 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import app.db.base


revision: str = '730f115b2f38'
down_revision: Union[str, None] = '6eeeb4bcd2a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Same re-runnable-migration pattern as ab1589948938: every create/add
    # below is guarded with an inspector check so a retried/partial deploy
    # can't fail on an object a prior attempt already created.
    bind = op.get_bind()

    def insp():
        return sa.inspect(bind)

    def has_table(name: str) -> bool:
        return insp().has_table(name)

    def has_column(table: str, column: str) -> bool:
        if not has_table(table):
            return False
        return column in {c['name'] for c in insp().get_columns(table)}

    def has_index(table: str, index_name: str) -> bool:
        if not has_table(table):
            return False
        return index_name in {i['name'] for i in insp().get_indexes(table)}

    # --- users: verification + preference columns ---
    if not has_column('users', 'email_verified'):
        op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    if not has_column('users', 'email_verified_at'):
        op.add_column('users', sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True))
    if not has_column('users', 'marketing_opt_in'):
        op.add_column('users', sa.Column('marketing_opt_in', sa.Boolean(), nullable=False, server_default=sa.text('false')))

    # --- email_tokens table ---
    email_token_purpose = postgresql.ENUM(
        'email_verification', 'password_reset', name='emailtokenpurpose', create_type=False
    )
    email_token_purpose.create(bind, checkfirst=True)

    if not has_table('email_tokens'):
        op.create_table(
            'email_tokens',
            sa.Column('user_id', app.db.base.GUID(), nullable=False),
            sa.Column('purpose', email_token_purpose, nullable=False),
            sa.Column('token_hash', sa.String(length=64), nullable=False),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('id', app.db.base.GUID(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
    if not has_index('email_tokens', op.f('ix_email_tokens_user_id')):
        op.create_index(op.f('ix_email_tokens_user_id'), 'email_tokens', ['user_id'], unique=False)
    if not has_index('email_tokens', op.f('ix_email_tokens_token_hash')):
        op.create_index(op.f('ix_email_tokens_token_hash'), 'email_tokens', ['token_hash'], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table('email_tokens'):
        op.drop_table('email_tokens')
        if bind.dialect.name == 'postgresql':
            op.execute('DROP TYPE IF EXISTS emailtokenpurpose')

    existing_user_columns = {c['name'] for c in inspector.get_columns('users')}
    for column_name in ('marketing_opt_in', 'email_verified_at', 'email_verified'):
        if column_name in existing_user_columns:
            op.drop_column('users', column_name)
