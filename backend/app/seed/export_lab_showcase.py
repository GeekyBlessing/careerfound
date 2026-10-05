"""Export the slice of the Project Lab curriculum the marketing pages show.

The homepage renders real Project Lab screens (the curriculum list, a project
workspace, a portfolio entry). Those screens read this snapshot, so the
titles, levels, skills and milestones on the homepage are the curriculum's own
and cannot drift from it. A backend test fails if the checked-in snapshot is
stale; refresh it with:

    cd backend && python -m app.seed.export_lab_showcase
"""

import json
from pathlib import Path

from app.seed.lab import LAB_CURRICULA
from app.seed.lab.universal import LEVEL_BLURBS, LEVEL_LABELS, LEVELS

SNAPSHOT_PATH = Path(__file__).resolve().parents[3] / "frontend" / "src" / "data" / "lab-cybersecurity.json"
CAREER = {"slug": "cybersecurity", "name": "Cybersecurity"}
FEATURED = "network-recon-tool"


def build_snapshot() -> dict:
    projects = LAB_CURRICULA[CAREER["slug"]]
    featured = next(p for p in projects if p["slug"] == FEATURED)
    return {
        "career": CAREER,
        "levels": [
            {
                "level": level,
                "label": LEVEL_LABELS[level],
                "blurb": LEVEL_BLURBS[level],
                "projects": [
                    {
                        "slug": p["slug"],
                        "title": p["title"],
                        "est_hours": p["est_hours"],
                        "difficulty": p["difficulty"],
                        "summary": p["summary"],
                        "skills": p["skills"][:4],
                        "tools": [t["name"] for t in p["tools"]],
                        "deliverable": p["deliverable"],
                    }
                    for p in projects
                    if p["level"] == level
                ],
            }
            for level in LEVELS
        ],
        "featured": {
            "slug": featured["slug"],
            "title": featured["title"],
            "level": featured["level"],
            "summary": featured["summary"],
            "skills": featured["skills"],
            "tools": [t["name"] for t in featured["tools"]],
            "deliverable": featured["deliverable"],
            "milestones": [{"stage": m["stage"], "title": m["title"]} for m in featured["milestones"]],
            "criteria": [c["text"] for c in featured["criteria"]],
            "interview": [q["q"] for q in featured["interview"]],
            "cv_bullet": featured["cv_bullet"],
        },
    }


def render() -> str:
    return json.dumps(build_snapshot(), indent=2, ensure_ascii=False) + "\n"


if __name__ == "__main__":
    SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
    SNAPSHOT_PATH.write_text(render(), encoding="utf-8")
    print(f"Wrote {SNAPSHOT_PATH}")
