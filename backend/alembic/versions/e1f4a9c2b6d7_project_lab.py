"""project lab: curriculum fields on projects, per-user evidence, portfolio repo url

Revision ID: e1f4a9c2b6d7
Revises: d8e2b5a7c1f4
Create Date: 2026-10-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.db.base import GUID


revision: str = 'e1f4a9c2b6d7'
down_revision: Union[str, None] = 'd8e2b5a7c1f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('slug', sa.String(length=100), nullable=True))
    op.add_column('projects', sa.Column('level', sa.String(length=20), nullable=True))
    op.add_column('projects', sa.Column('sequence', sa.Integer(), nullable=True))
    op.add_column('projects', sa.Column('est_hours', sa.Integer(), nullable=True))
    op.add_column('projects', sa.Column('kind', sa.String(length=20), nullable=True))
    op.add_column('projects', sa.Column('lab', sa.JSON(), nullable=True))
    op.create_index('ix_projects_slug', 'projects', ['slug'])

    op.add_column('portfolio_items', sa.Column('repo_url', sa.String(length=300), nullable=False, server_default=''))

    op.create_table(
        'project_lab_progress',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('project_id', GUID(), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('milestones', sa.JSON(), nullable=False),
        sa.Column('checklist', sa.JSON(), nullable=False),
        sa.Column('repo_url', sa.String(length=300), nullable=False, server_default=''),
        sa.Column('repo_check', sa.JSON(), nullable=False),
        sa.Column('interview_answers', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('user_id', 'project_id', name='uq_lab_progress_user_project'),
    )
    op.create_index('ix_project_lab_progress_user_id', 'project_lab_progress', ['user_id'])
    op.create_index('ix_project_lab_progress_project_id', 'project_lab_progress', ['project_id'])


def downgrade() -> None:
    op.drop_index('ix_project_lab_progress_project_id', table_name='project_lab_progress')
    op.drop_index('ix_project_lab_progress_user_id', table_name='project_lab_progress')
    op.drop_table('project_lab_progress')
    op.drop_column('portfolio_items', 'repo_url')
    op.drop_index('ix_projects_slug', table_name='projects')
    for col in ('lab', 'kind', 'est_hours', 'sequence', 'level', 'slug'):
        op.drop_column('projects', col)
