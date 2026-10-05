"""careerfound 2.0: skills, certifications, public profile, job analyses, project review, case study

Revision ID: f2c7d9a1b3e5
Revises: e1f4a9c2b6d7
Create Date: 2026-10-05 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.db.base import GUID


revision: str = 'f2c7d9a1b3e5'
down_revision: Union[str, None] = 'e1f4a9c2b6d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _stamps():
    return [
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    ]


def upgrade() -> None:
    op.create_table(
        'user_skills',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(length=80), nullable=False),
        sa.Column('name_key', sa.String(length=80), nullable=False),
        sa.Column('level', sa.String(length=20), nullable=False, server_default='learning'),
        *_stamps(),
        sa.UniqueConstraint('user_id', 'name_key', name='uq_user_skill_name'),
    )
    op.create_index('ix_user_skills_user_id', 'user_skills', ['user_id'])

    op.create_table(
        'user_certifications',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(length=160), nullable=False),
        sa.Column('issuer', sa.String(length=120), nullable=False, server_default=''),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='earned'),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('credential_url', sa.String(length=300), nullable=False, server_default=''),
        *_stamps(),
    )
    op.create_index('ix_user_certifications_user_id', 'user_certifications', ['user_id'])

    op.create_table(
        'public_profiles',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('username', sa.String(length=30), nullable=False),
        sa.Column('headline', sa.String(length=140), nullable=False, server_default=''),
        sa.Column('bio', sa.Text(), nullable=False, server_default=''),
        sa.Column('location', sa.String(length=80), nullable=False, server_default=''),
        sa.Column('github_url', sa.String(length=300), nullable=False, server_default=''),
        sa.Column('linkedin_url', sa.String(length=300), nullable=False, server_default=''),
        sa.Column('website_url', sa.String(length=300), nullable=False, server_default=''),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('show_readiness', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('show_skills', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('show_certifications', sa.Boolean(), nullable=False, server_default=sa.true()),
        *_stamps(),
    )
    op.create_index('ix_public_profiles_user_id', 'public_profiles', ['user_id'], unique=True)
    op.create_index('ix_public_profiles_username', 'public_profiles', ['username'], unique=True)

    op.create_table(
        'job_analyses',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(length=160), nullable=False, server_default=''),
        sa.Column('company', sa.String(length=160), nullable=False, server_default=''),
        sa.Column('source_url', sa.String(length=400), nullable=False, server_default=''),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('result', sa.JSON(), nullable=False),
        sa.Column('match_pct', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('verdict', sa.String(length=20), nullable=False, server_default=''),
        sa.Column('analysed_at', sa.DateTime(timezone=True), nullable=True),
        *_stamps(),
    )
    op.create_index('ix_job_analyses_user_id', 'job_analyses', ['user_id'])

    op.add_column('project_lab_progress', sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('project_lab_progress', sa.Column('submitted_note', sa.Text(), nullable=False, server_default=''))
    op.add_column('project_lab_progress', sa.Column('submitted_repo_url', sa.String(length=300), nullable=False, server_default=''))
    op.add_column('project_lab_progress', sa.Column('review_status', sa.String(length=20), nullable=False, server_default='none'))
    op.add_column('project_lab_progress', sa.Column('reviewer_id', GUID(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('project_lab_progress', sa.Column('reviewer_name', sa.String(length=160), nullable=False, server_default=''))
    op.add_column('project_lab_progress', sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('project_lab_progress', sa.Column('review_note', sa.Text(), nullable=False, server_default=''))

    op.add_column('portfolio_items', sa.Column('case_study', sa.JSON(), nullable=False, server_default='{}'))
    op.add_column('portfolio_items', sa.Column('live_url', sa.String(length=300), nullable=False, server_default=''))


def downgrade() -> None:
    op.drop_column('portfolio_items', 'live_url')
    op.drop_column('portfolio_items', 'case_study')
    for col in ('review_note', 'reviewed_at', 'reviewer_name', 'reviewer_id', 'review_status', 'submitted_repo_url', 'submitted_note', 'submitted_at'):
        op.drop_column('project_lab_progress', col)
    op.drop_index('ix_job_analyses_user_id', table_name='job_analyses')
    op.drop_table('job_analyses')
    op.drop_index('ix_public_profiles_username', table_name='public_profiles')
    op.drop_index('ix_public_profiles_user_id', table_name='public_profiles')
    op.drop_table('public_profiles')
    op.drop_index('ix_user_certifications_user_id', table_name='user_certifications')
    op.drop_table('user_certifications')
    op.drop_index('ix_user_skills_user_id', table_name='user_skills')
    op.drop_table('user_skills')
