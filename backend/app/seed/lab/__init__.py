"""Project Lab curricula, one list of projects per career slug. A career with
no entry here keeps its existing roadmap projects until its curriculum is
authored."""

from app.seed.lab.cybersecurity import PROJECTS as CYBERSECURITY_PROJECTS

LAB_CURRICULA: dict[str, list[dict]] = {
    "cybersecurity": CYBERSECURITY_PROJECTS,
}
