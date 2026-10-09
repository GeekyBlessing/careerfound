#!/usr/bin/env python3
"""Validate one authored career module against the content rules and against
every career already in the catalogue (so nothing is copied).

    python3 scripts/check_new_careers.py app.seed.new_careers.software

A module exports CAREERS (list of career dicts), META (slug -> dict of
keywords, who_its_for, portfolio_expectations, career_progression) and
PROJECTS (slug -> light roadmap content).
"""
import importlib
import sys

sys.path.insert(0, ".")

from app.seed.career_paths import CAREER_PATHS  # noqa: E402
from app.seed.catalogue_validation import check_catalogue  # noqa: E402
from app.seed.roadmap_content_extra import PATH_PROJECTS  # noqa: E402

mod = importlib.import_module(sys.argv[1])
slugs = [c["slug"] for c in mod.CAREERS]
problems: list[str] = []
if set(slugs) != set(mod.META) or set(slugs) != set(mod.PROJECTS):
    problems.append(f"CAREERS {sorted(slugs)}, META {sorted(mod.META)} and PROJECTS {sorted(mod.PROJECTS)} must name the same careers")
merged = [{**c, **mod.META.get(c["slug"], {})} for c in mod.CAREERS]
existing = [dict(c) for c in CAREER_PATHS if c["slug"] not in slugs]
roadmaps = {**{k: v for k, v in PATH_PROJECTS.items() if k not in slugs}, **mod.PROJECTS}
all_problems = check_catalogue(existing + merged, roadmaps, light_only=set(roadmaps))
# Only report problems that involve the new module (the existing catalogue is already clean).
mine = [p for p in all_problems if any(p.startswith(s) or f" from {s}" in p or f"{s}/" in p for s in slugs)]
others = [p for p in all_problems if p not in mine]
for p in problems + mine + others:
    print("PROBLEM:", p)
print(f"{len(slugs)} careers checked: {len(problems) + len(all_problems)} problem(s)")
sys.exit(1 if (problems or all_problems) else 0)
