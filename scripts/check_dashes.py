#!/usr/bin/env python3
"""
Repo-wide guard against long-dash punctuation reaching CareerFound's
user-facing surfaces (UI copy, marketing content, seed/mentor/career data,
API-facing text).

CareerFound's house style is ASCII punctuation only: a plain hyphen-minus
(U+002D), commas, periods, colons, parentheses, or a vertical bar where a
title needs one ("Software Engineer | Cybersecurity Expert"). Typographic
dashes (em dash, en dash, and their rarer cousins) and HTML-entity dashes
must never appear in copy someone actually reads on the site.

This script is deliberately scoped to the directories that hold real
product copy, not the whole repository: developer documentation (README,
ARCHITECTURE.md, docs/, infra/) and source-code comments are not "the
website" and are intentionally left alone, since flagging every dash a
developer types in an inline comment would make this check noisy enough
that nobody keeps it green. If CareerFound ever adds a docs/content
surface that IS rendered to end users, add its path to CONTENT_PATHS below.

Usage:
    python3 scripts/check_dashes.py            # scan default content paths
    python3 scripts/check_dashes.py --paths frontend/src backend/app/seed

Exit code is 0 when clean, 1 when violations are found (suitable for CI).
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Directories that hold real, rendered CareerFound copy. Deliberately
# excludes README.md/ARCHITECTURE.md/docs//infra/ (developer documentation,
# never shown to a website visitor) and backend/app/core, backend/alembic,
# backend/app/models, backend/app/ai (internal plumbing, migrations, and
# LLM-prompt internals rather than user-facing text).
CONTENT_PATHS = [
    "frontend/src",
    "backend/app/seed",
    "backend/app/services",
    "backend/app/api",
    "backend/app/schemas",
]

EXCLUDE_DIRS = {
    "node_modules", ".next", ".git", "dist", "build", "__pycache__",
    ".venv", "venv", "_to_delete", ".pytest_cache",
}

SCAN_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mdx", ".py", ".json"}

# Every character in this list is prohibited outright in scanned files,
# regardless of context, because none of them has a legitimate reason to
# appear in application source at all (unlike a bare ASCII "-", which is
# also a subtraction/negation operator in real code).
# Built with chr() rather than literal characters or \u escapes so this
# checker script does not itself contain a single instance of any of the
# characters it exists to forbid.
FORBIDDEN_CHARS: dict[str, str] = {
    chr(0x2010): "HYPHEN (U+2010)",
    chr(0x2011): "NON-BREAKING HYPHEN (U+2011)",
    chr(0x2012): "FIGURE DASH (U+2012)",
    chr(0x2013): "EN DASH (U+2013)",
    chr(0x2014): "EM DASH (U+2014)",
    chr(0x2015): "HORIZONTAL BAR (U+2015)",
    chr(0x2053): "SWUNG DASH (U+2053)",
    chr(0x2E3A): "TWO-EM DASH (U+2E3A)",
    chr(0x2E3B): "THREE-EM DASH (U+2E3B)",
    chr(0x2E40): "DOUBLE HYPHEN (U+2E40)",
    chr(0x2212): "MINUS SIGN (U+2212)",
}

HTML_ENTITY_RE = re.compile(r"&mdash;|&ndash;|&#8212;|&#8211;|&#x2014;|&#x2013;", re.IGNORECASE)

# Two or more ASCII hyphens in a row, used as a stand-in for a long dash in
# prose ("fast--but shaky"). Deliberately does NOT flag:
#   - CSS custom properties / Tailwind arbitrary values: --fg-tint, --color-x
#   - CLI flags in shell snippets: --build, --reload
#   - Markdown table separator rows: |---|---|
#   - Markdown horizontal rules: a line that is only dashes
REPEATED_HYPHEN_RE = re.compile(r"(?<![A-Za-z0-9])-{2,}(?![A-Za-z])")
MD_TABLE_SEP_RE = re.compile(r"^\s*\|?[\s:|-]+\|?\s*$")
MD_HR_RE = re.compile(r"^-{2,}$")

# Inline code spans (`...`) usually hold a real shell/CLI snippet where a
# repeated hyphen is genuine syntax (e.g. the npm/yarn "--" argument
# separator: `npm create vite@latest app -- --template react`), not prose
# punctuation. Strip their contents before the repeated-hyphen check so
# real commands aren't flagged, while the em-dash-family check still runs
# on them (a typographic dash has no legitimate reason to appear in a
# shell command either).
BACKTICK_SPAN_RE = re.compile(r"`[^`]*`")

JS_LIKE_EXT = {".ts", ".tsx", ".js", ".jsx", ".mdx"}
PY_EXT = {".py"}


@dataclass
class Violation:
    file: str
    line: int
    label: str
    text: str


def iter_files(paths: list[str]):
    for rel in paths:
        abs_path = os.path.join(REPO_ROOT, rel)
        if os.path.isfile(abs_path):
            yield abs_path
            continue
        for dirpath, dirnames, filenames in os.walk(abs_path):
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
            for fn in filenames:
                if os.path.splitext(fn)[1] in SCAN_EXTENSIONS:
                    yield os.path.join(dirpath, fn)


def strip_comments(lines: list[str], ext: str) -> list[tuple[str, bool]]:
    """Return, per input line, the code-only portion of that line plus
    whether the line was (at least partly) inside a comment/docstring.

    Handles JS/TS/JSX line comments (//), block comments (/* ... */,
    which also covers JSX's {/* ... */}), and Python line comments (#)
    and triple-quoted docstrings, including ones that span
    multiple lines. This is a pragmatic scanner, not a real parser: it
    can be fooled by things like a "#" inside a Python string or a "//"
    inside a URL, but for a prose-focused dash check that trade-off is
    the right one, since it keeps real comments from drowning out real
    regressions in visible copy.
    """
    out: list[tuple[str, bool]] = []
    in_block = False
    end_marker = ""

    for raw in lines:
        working = raw
        had_comment = False

        if in_block:
            idx = working.find(end_marker)
            if idx == -1:
                out.append(("", True))
                continue
            working = working[idx + len(end_marker):]
            in_block = False
            had_comment = True

        if ext in PY_EXT:
            for tok in ('"""', "'''"):
                # Strip complete inline pairs first (single-line docstrings
                # such as `"""Private: ..."""`), then treat a leftover,
                # unpaired occurrence as the start of a multi-line one.
                while working.count(tok) >= 2:
                    start = working.find(tok)
                    end = working.find(tok, start + len(tok))
                    had_comment = True
                    working = working[:start] + working[end + len(tok):]
                idx = working.find(tok)
                if idx != -1:
                    had_comment = True
                    in_block = True
                    end_marker = tok
                    working = working[:idx]
                    break
            idx = working.find("#")
            if idx != -1:
                had_comment = True
                working = working[:idx]

        if ext in JS_LIKE_EXT:
            idx = working.find("/*")
            while idx != -1:
                had_comment = True
                end_idx = working.find("*/", idx + 2)
                if end_idx == -1:
                    in_block = True
                    end_marker = "*/"
                    working = working[:idx]
                    break
                working = working[:idx] + working[end_idx + 2:]
                idx = working.find("/*")
            idx = working.find("//")
            if idx != -1:
                had_comment = True
                working = working[:idx]

        out.append((working, had_comment))

    return out


def scan_file(path: str) -> list[Violation]:
    rel = os.path.relpath(path, REPO_ROOT)
    ext = os.path.splitext(path)[1]
    violations: list[Violation] = []
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            raw_lines = f.readlines()
    except OSError:
        return violations

    code_lines = strip_comments(raw_lines, ext)

    for i, (raw, (code, _had_comment)) in enumerate(zip(raw_lines, code_lines), start=1):
        stripped_raw = raw.strip()

        for ch, label in FORBIDDEN_CHARS.items():
            if ch in code:
                violations.append(Violation(rel, i, label, stripped_raw[:160]))

        for m in HTML_ENTITY_RE.finditer(code):
            violations.append(Violation(rel, i, f"HTML ENTITY ({m.group()})", stripped_raw[:160]))

        if not MD_TABLE_SEP_RE.match(raw) and not MD_HR_RE.match(stripped_raw):
            code_outside_backticks = BACKTICK_SPAN_RE.sub("", code)
            for m in REPEATED_HYPHEN_RE.finditer(code_outside_backticks):
                violations.append(Violation(rel, i, f"REPEATED HYPHEN ({m.group()})", stripped_raw[:160]))

    return violations


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--paths", nargs="+", default=CONTENT_PATHS, help="Paths (relative to repo root) to scan.")
    args = parser.parse_args()

    all_violations: list[Violation] = []
    for path in iter_files(args.paths):
        all_violations.extend(scan_file(path))

    if not all_violations:
        print("check_dashes: clean. No prohibited long-dash characters found in user-facing content.")
        return 0

    print(f"check_dashes: {len(all_violations)} violation(s) found:\n")
    for v in all_violations:
        print(f"  {v.file}:{v.line}  [{v.label}]  {v.text}")
    print(
        "\nReplace with a plain ASCII hyphen (-), comma, period, colon, "
        "parentheses, or a vertical bar, and rewrite the sentence naturally "
        "rather than substituting a hyphen in place of every dash."
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
