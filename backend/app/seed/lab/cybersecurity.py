"""The Cybersecurity project curriculum: twelve projects that rise from small
single skill tools to a flagship platform. Order inside each level follows the
roadmap phase the project belongs to."""

from app.seed.lab.cyber_advanced import ADVANCED
from app.seed.lab.cyber_beginner import BEGINNER
from app.seed.lab.cyber_intermediate import INTERMEDIATE

PROJECTS = [*BEGINNER, *INTERMEDIATE, *[p for p in ADVANCED if p["level"] == "advanced"], *[p for p in ADVANCED if p["level"] == "job_ready"]]
