"""Look at a public GitHub repository and report what is actually there.

This is evidence gathering, not code verification: it confirms that a public
repository exists, has a README, a .gitignore and a real commit history, and
that no .env file was committed. It never clones, runs or grades the code.
It uses GitHub's unauthenticated public API, so it can only see public
repositories, and it degrades to a clear message when GitHub is unreachable
or rate limiting the server.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone

import httpx

MIN_COMMITS = 3
_URL = re.compile(r"^https?://(?:www\.)?github\.com/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))/([A-Za-z0-9._-]{1,100}?)(?:\.git)?/?$")
_API = "https://api.github.com"
_HEADERS = {"Accept": "application/vnd.github+json", "User-Agent": "careerfound-project-lab"}


class InvalidRepositoryUrl(ValueError):
    pass


def parse_repo_url(url: str) -> tuple[str, str]:
    """Return (owner, repo) for a plain github.com repository URL, else raise."""
    match = _URL.match((url or "").strip())
    if not match:
        raise InvalidRepositoryUrl("Paste the link to your repository, like https://github.com/your-name/your-project")
    owner, repo = match.group(1), match.group(2)
    if repo in {".", ".."} or owner.endswith("-"):
        raise InvalidRepositoryUrl("That does not look like a repository link.")
    return owner, repo


def canonical_url(owner: str, repo: str) -> str:
    return f"https://github.com/{owner}/{repo}"


def evaluate(state: dict) -> dict:
    """Turn raw facts into the pass or fail checks the Lab shows."""
    checks = {
        "public": bool(state.get("reachable") and state.get("public")),
        "readme": bool(state.get("readme")),
        "commits": int(state.get("commit_count") or 0) >= MIN_COMMITS,
        "gitignore": bool(state.get("gitignore")),
        "no_env_committed": state.get("reachable", False) and not state.get("env_committed", False),
        # Shown as extra evidence. Neither is required to pass the check.
        "tests": bool(state.get("tests")),
        "license": bool(state.get("license")),
    }
    state["checks"] = checks
    state["passed"] = bool(checks["public"] and checks["readme"] and checks["commits"] and checks["no_env_committed"])
    return state


async def inspect_repository(url: str) -> dict:
    owner, repo = parse_repo_url(url)
    state: dict = {
        "url": canonical_url(owner, repo),
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "reachable": False,
        "public": False,
        "readme": False,
        "gitignore": False,
        "env_committed": False,
        "tests": False,
        "license": False,
        "commit_count": 0,
        "error": "",
    }
    try:
        async with httpx.AsyncClient(timeout=10, headers=_HEADERS) as client:
            repo_resp = await client.get(f"{_API}/repos/{owner}/{repo}")
            if repo_resp.status_code == 404:
                state["error"] = "GitHub could not find that repository. It may not exist, or it may be private. A private repository cannot be checked."
                return evaluate(state)
            if repo_resp.status_code in (403, 429):
                state["error"] = "GitHub is limiting requests right now. Wait a few minutes and check again."
                return evaluate(state)
            if repo_resp.status_code != 200:
                state["error"] = f"GitHub answered with status {repo_resp.status_code}. Try again shortly."
                return evaluate(state)

            info = repo_resp.json()
            state["reachable"] = True
            state["public"] = not info.get("private", True)
            state["default_branch"] = info.get("default_branch", "main")
            state["description"] = info.get("description") or ""
            state["pushed_at"] = info.get("pushed_at") or ""
            state["language"] = info.get("language") or ""
            state["archived"] = bool(info.get("archived"))

            readme = await client.get(f"{_API}/repos/{owner}/{repo}/readme")
            state["readme"] = readme.status_code == 200
            if readme.status_code == 200:
                state["readme_bytes"] = int(readme.json().get("size", 0))

            commits = await client.get(f"{_API}/repos/{owner}/{repo}/commits", params={"per_page": 30})
            if commits.status_code == 200:
                state["commit_count"] = len(commits.json())

            root = await client.get(f"{_API}/repos/{owner}/{repo}/contents")
            if root.status_code == 200 and isinstance(root.json(), list):
                names = {str(item.get("name", "")) for item in root.json()}
                state["gitignore"] = ".gitignore" in names
                lowered = {n.lower() for n in names}
                state["tests"] = bool(lowered & {"tests", "test", "__tests__", "spec", "specs"}) or any(n.startswith("test_") or n.endswith("_test.py") for n in lowered)
                state["license"] = any(n.startswith("license") or n.startswith("licence") for n in lowered)
                state["env_committed"] = any(n == ".env" or (n.startswith(".env.") and n not in {".env.example", ".env.sample", ".env.template"}) for n in names)
    except httpx.HTTPError:
        state["error"] = "Could not reach GitHub from the server. Check again in a moment."
        state["reachable"] = False
    return evaluate(state)
