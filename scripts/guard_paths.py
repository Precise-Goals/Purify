#!/usr/bin/env python3
"""
Path/lane guard for BreatheWise harness.
Usage: python scripts/guard_paths.py --role <role> [--diff <file>]
Reads changed files from stdin (one per line) or --diff file.
Exits non-zero if any file is outside the role's allow-list or the lane's lock.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Role allow-lists: maps role name → list of path prefixes/patterns the role may WRITE
ROLE_ALLOW = {
    "orchestrator":  ["harness/state/", "harness/logs/"],
    "po-spec":       ["harness/artifacts/"],   # only 01-spec.md
    "designer":      ["harness/artifacts/", "docs/adr/"],
    "tech-lead":     ["harness/artifacts/", "docs/adr/"],
    "test-author":   ["tests/", "harness/artifacts/"],
    "builder":       ["src/", "harness/artifacts/", "harness/state/locks/"],
    "reviewer":      ["harness/artifacts/"],
    "security":      ["harness/artifacts/"],
    "qa":            ["harness/artifacts/"],
    "scribe":        ["docs/", "harness/artifacts/", "README.md", "CHANGELOG.md"],
    "librarian":     ["docs/memory/", "harness/artifacts/", "AGENTS.md"],
}

# Always forbidden paths (no role except orchestrator via atomic rename may write state.json)
ALWAYS_FORBIDDEN = [
    "docs/raw.md",
    "docs/prompt.md",
]

# State.json: only orchestrator may write it (atomic rename pattern)
STATE_JSON = "harness/state/state.json"


def load_lane_lock(role):
    """Return the set of paths a lane has locked, if any."""
    locks_dir = ROOT / "harness/state/locks"
    if not locks_dir.exists():
        return set()
    owned = set()
    for lock_file in locks_dir.glob("*.json"):
        try:
            data = json.loads(lock_file.read_text())
            if data.get("agent") == role or data.get("lane", "").startswith("lane-"):
                owned.update(data.get("owns", []))
        except Exception:
            pass
    return owned


def is_allowed(path: str, role: str, lane_owns: set) -> bool:
    # Always forbidden for all roles
    for forbidden in ALWAYS_FORBIDDEN:
        if path == forbidden or path.startswith(forbidden):
            return False

    # state.json: only orchestrator may write
    if path == STATE_JSON and role != "orchestrator":
        return False

    # Role allow-list check
    prefixes = ROLE_ALLOW.get(role, [])
    role_ok = any(path.startswith(p) for p in prefixes)

    # Lane lock: builder must only write to lane-owned paths
    if role == "builder" and lane_owns:
        return path in lane_owns or path.startswith("harness/artifacts/") or path.startswith("harness/state/locks/")

    return role_ok


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Guard role-scoped path writes")
    parser.add_argument("--role", required=True, help="Agent role name")
    parser.add_argument("--diff", help="File containing changed paths (one per line); default: stdin")
    args = parser.parse_args()

    role = args.role.lower()
    if role not in ROLE_ALLOW:
        print(f"ERROR: unknown role '{role}'")
        sys.exit(2)

    if args.diff:
        paths = Path(args.diff).read_text().splitlines()
    else:
        paths = sys.stdin.read().splitlines()

    paths = [p.strip() for p in paths if p.strip()]
    lane_owns = load_lane_lock(role)

    violations = [p for p in paths if not is_allowed(p, role, lane_owns)]

    if violations:
        print(f"GUARD VIOLATION — role '{role}' may not write:")
        for v in violations:
            print(f"  {v}")
        sys.exit(1)

    print(f"guard OK — {len(paths)} path(s) checked for role '{role}'")
    sys.exit(0)


if __name__ == "__main__":
    main()
