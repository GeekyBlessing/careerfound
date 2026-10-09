"""What can honestly be said about a project's verification.

Two different things can be true of a project, and they are never blurred:

* Evidence checked: CareerFound looked at the public GitHub repository and
  confirmed it is public, has a README, a real commit history and no committed
  .env file. This is a machine check of what exists. It is not a review of the
  code.
* Verified: a real reviewer (a mentor or an admin on CareerFound) read the
  submission, looked at the repository and signed their name to an approval of
  that exact repository.

The tier is computed from stored facts every time it is read, so it cannot
drift: if the repository link changes after an approval, the approval no
longer applies and the tier falls back to what the new evidence supports.
"""

from __future__ import annotations

from app.models.lab import ProjectLabProgress

TIERS = ("none", "evidence_checked", "in_review", "changes_requested", "verified")

BADGE_TITLE = "CareerFound Verified Project"
CHECKED_TITLE = "Repository checked"

TIER_COPY = {
    "none": "No evidence to check yet.",
    "evidence_checked": "CareerFound confirmed a public repository with a README and a real commit history. The code has not been reviewed by a person.",
    "in_review": "Submitted. A reviewer has not looked at it yet.",
    "changes_requested": "A reviewer asked for changes. Update the repository and submit it again.",
    "verified": "A CareerFound reviewer read this project and approved the repository.",
}


def verification(progress: ProjectLabProgress | None, state: dict, kind: str | None) -> dict:
    """`state` is the dict returned by lab_service.derive for the same project."""
    completed = bool(state["flags"]["completed"])
    repo_url = progress.repo_url if progress else ""
    # Code projects need a checked public repository. Case studies have no
    # repository to check, so completion is the only automated evidence.
    evidence_ok = completed and (bool(state["repo_ok"]) if kind != "case_study" else True)

    review = (progress.review_status if progress else "none") or "none"
    submitted_for = progress.submitted_repo_url if progress else ""
    same_work = bool(progress) and submitted_for == repo_url
    stale = bool(progress) and review in {"approved", "pending", "changes_requested"} and not same_work

    if review == "approved" and same_work and evidence_ok:
        tier = "verified"
    elif review == "pending" and same_work and evidence_ok:
        tier = "in_review"
    elif review == "changes_requested" and same_work:
        tier = "changes_requested"
    elif evidence_ok:
        tier = "evidence_checked"
    else:
        tier = "none"

    can_submit = evidence_ok and tier in {"evidence_checked", "changes_requested"}
    blockers: list[str] = []
    if not completed:
        blockers.append("Complete the project first.")
    elif not evidence_ok:
        blockers.append("Publish a public repository and run the repository check first.")

    check = (state.get("repo_check") or {}).get("checks", {}) if state.get("repo_ok") else {}
    badge = None
    if tier == "verified":
        badge = {"title": BADGE_TITLE, "tier": "verified"}
    elif tier == "evidence_checked":
        badge = {"title": CHECKED_TITLE, "tier": "evidence_checked"}

    return {
        "tier": tier,
        "evidence_checked": bool(evidence_ok),
        "badge": badge,
        "copy": TIER_COPY[tier],
        "stale": stale,
        "can_submit": can_submit,
        "submit_blockers": blockers,
        "review_status": review if not stale else "none",
        "submitted_at": progress.submitted_at.isoformat() if progress and progress.submitted_at and same_work else None,
        "reviewer_name": progress.reviewer_name if progress and tier in {"verified", "changes_requested"} else "",
        "reviewed_at": progress.reviewed_at.isoformat() if progress and progress.reviewed_at and tier in {"verified", "changes_requested"} else None,
        "review_note": progress.review_note if progress and tier in {"verified", "changes_requested"} else "",
        "repo_url": repo_url,
        "automated_checks": {
            "public": bool(check.get("public")),
            "readme": bool(check.get("readme")),
            "commits": bool(check.get("commits")),
            "no_env_committed": bool(check.get("no_env_committed")),
            "gitignore": bool(check.get("gitignore")),
            "tests": bool(check.get("tests")),
            "license": bool(check.get("license")),
        },
    }
