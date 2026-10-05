"""career catalogue taxonomy: categories, relationships, slug renames

Revision ID: d8e2b5a7c1f4
Revises: c4b7d1e9a3f2
Create Date: 2026-10-05 09:00:00.000000

"""
import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd8e2b5a7c1f4'
down_revision: Union[str, None] = 'c4b7d1e9a3f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


LIST_COLUMNS = ("related_slugs", "keywords", "portfolio_expectations", "career_progression")

# Old slug -> new slug. The old URLs keep working through
# app.services.career_taxonomy.LEGACY_SLUG_REDIRECTS and the frontend redirect.
RENAMES = {
    "ai-ml-engineering": ("ai-engineering", "AI Engineering"),
    "soc-analysis": ("security-operations", "Security Operations (SOC)"),
    "devops": ("devops-engineering", "DevOps Engineering"),
}

# Slug -> category, so existing rows are filed correctly before the seed's
# catalogue sync refreshes the rest of their content.
CATEGORY_BY_SLUG = {
    "cybersecurity": "security", "security-operations": "security",
    "penetration-testing": "security", "cloud-security": "security",
    "software-engineering": "engineering", "frontend-development": "engineering",
    "backend-engineering": "engineering", "full-stack-development": "engineering",
    "mobile-development": "engineering", "qa-engineering": "engineering",
    "cloud-engineering": "cloud-infrastructure", "devops-engineering": "cloud-infrastructure",
    "solutions-architecture": "cloud-infrastructure",
    "data-analysis": "data-ai", "data-science": "data-ai",
    "data-engineering": "data-ai", "ai-engineering": "data-ai",
    "ui-ux-design": "design-product", "product-design": "design-product",
    "product-management": "design-product", "graphic-design": "design-product",
    "it-support": "operations-digital", "no-code-automation": "operations-digital",
    "technical-writing": "operations-digital",
}


def upgrade() -> None:
    bind = op.get_bind()
    existing_columns = {c['name'] for c in sa.inspect(bind).get_columns('career_paths')}

    if 'category' not in existing_columns:
        op.add_column('career_paths', sa.Column('category', sa.String(40), nullable=False, server_default=''))
        op.create_index('ix_career_paths_category', 'career_paths', ['category'])
    if 'who_its_for' not in existing_columns:
        op.add_column('career_paths', sa.Column('who_its_for', sa.Text(), nullable=False, server_default=''))
    for column_name in LIST_COLUMNS:
        if column_name not in existing_columns:
            op.add_column(
                'career_paths',
                sa.Column(column_name, sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
            )

    # Rename slugs in place (ids are untouched, so roadmaps, progress,
    # communities and portfolio items keep pointing at the same row). Skip a
    # rename if the target slug already exists (a re-run, or a seed that ran
    # first and created the new row).
    for old, (new, new_name) in RENAMES.items():
        old_row = bind.execute(sa.text("SELECT id FROM career_paths WHERE slug = :s"), {"s": old}).first()
        new_row = bind.execute(sa.text("SELECT id FROM career_paths WHERE slug = :s"), {"s": new}).first()
        if old_row and not new_row:
            bind.execute(
                sa.text("UPDATE career_paths SET slug = :new, name = :name WHERE slug = :old"),
                {"new": new, "name": new_name, "old": old},
            )

    # Rewrite mentor and mentor-application tags (JSON lists of slugs) to the
    # new slugs.
    for table in ("mentors", "mentor_applications"):
        if table not in sa.inspect(bind).get_table_names():
            continue
        rows = bind.execute(sa.text(f"SELECT id, paths FROM {table}")).fetchall()
        for row_id, paths in rows:
            value = json.loads(paths) if isinstance(paths, str) else paths
            if not isinstance(value, list):
                continue
            updated = []
            for slug in value:
                slug = RENAMES[slug][0] if slug in RENAMES else slug
                if slug not in updated:
                    updated.append(slug)
            if updated != value:
                bind.execute(
                    sa.text(f"UPDATE {table} SET paths = :p WHERE id = :i"),
                    {"p": json.dumps(updated), "i": row_id},
                )

    for slug, category in CATEGORY_BY_SLUG.items():
        bind.execute(
            sa.text("UPDATE career_paths SET category = :c WHERE slug = :s AND (category IS NULL OR category = '')"),
            {"c": category, "s": slug},
        )


def downgrade() -> None:
    bind = op.get_bind()
    for old, (new, _name) in RENAMES.items():
        bind.execute(sa.text("UPDATE career_paths SET slug = :old WHERE slug = :new"), {"old": old, "new": new})
    for column_name in reversed(LIST_COLUMNS):
        op.drop_column('career_paths', column_name)
    op.drop_column('career_paths', 'who_its_for')
    op.drop_index('ix_career_paths_category', table_name='career_paths')
    op.drop_column('career_paths', 'category')
