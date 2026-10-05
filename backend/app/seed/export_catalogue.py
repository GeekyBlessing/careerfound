"""Export the searchable slice of the career catalogue as JSON.

The frontend search test runs against this snapshot so it exercises the real
catalogue (AWS, Python and Figma queries and so on) instead of a hand-written
stub. A backend test fails if the checked-in snapshot is stale; refresh it
with:

    cd backend && python -m app.seed.export_catalogue
"""

import json
from pathlib import Path

from app.seed.career_paths import CAREER_PATHS
from app.services.career_taxonomy import category_label

FIELDS = ("slug", "name", "category", "summary", "keywords", "entry_roles", "tools", "skills_required", "related_slugs")
SNAPSHOT_PATH = Path(__file__).resolve().parents[3] / "frontend" / "tests" / "fixtures" / "catalogue.json"


def build_snapshot() -> list[dict]:
    return [
        {**{field: path[field] for field in FIELDS}, "category_label": category_label(path["category"])}
        for path in CAREER_PATHS
    ]


def render() -> str:
    return json.dumps(build_snapshot(), indent=2, ensure_ascii=False) + "\n"


if __name__ == "__main__":
    SNAPSHOT_PATH.write_text(render(), encoding="utf-8")
    print(f"Wrote {SNAPSHOT_PATH}")
