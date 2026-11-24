#!/usr/bin/env python3
"""
Circuit breaker for BreatheWise harness.
Usage: python scripts/breaker.py check --stage <stage> [--failures <n>] [--signature <hash>]
       python scripts/breaker.py trip --reason "<reason>"
       python scripts/breaker.py reset

Reads budgets from harness/state/budgets.json and state from harness/state/state.json.
Exits 0 = OK to continue, 1 = breaker tripped (stop and ask user).
"""
import hashlib, json, sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATE_PATH = ROOT / "harness/state/state.json"
BUDGETS_PATH = ROOT / "harness/state/budgets.json"
FAILURES_LOG = ROOT / "harness/logs/failures.log.md"


def load(p):
    try:
        return json.loads(Path(p).read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(state):
    tmp = STATE_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state, indent=2), encoding="utf-8")
    tmp.replace(STATE_PATH)


def trip(reason: str, state=None, budgets=None):
    state = state or load(STATE_PATH)
    state["breaker"] = {"tripped": True, "reason": reason}
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    save_state(state)
    # Append to failures log
    FAILURES_LOG.parent.mkdir(parents=True, exist_ok=True)
    with FAILURES_LOG.open("a", encoding="utf-8") as f:
        f.write(f"\n### BREAKER TRIP | {datetime.now(timezone.utc).isoformat()} | {reason}\n")
    print(f"BREAKER TRIPPED: {reason}")
    sys.exit(1)


def check_cmd(args):
    state = load(STATE_PATH)
    budgets = load(BUDGETS_PATH)

    # Already tripped?
    if state.get("breaker", {}).get("tripped"):
        print(f"BREAKER ALREADY TRIPPED: {state['breaker'].get('reason')}")
        sys.exit(1)

    stage = getattr(args, "stage", None)
    failures = int(getattr(args, "failures", 0) or 0)
    signature = getattr(args, "signature", None)

    # Trip condition 1: same stage failed > max_stage_retries
    attempts = state.get("attempts", {})
    stage_attempts = attempts.get(stage, 0) if stage else 0
    max_retries = budgets.get("max_stage_retries", 3)
    if stage_attempts > max_retries:
        trip(f"Stage '{stage}' failed {stage_attempts} times (max {max_retries})", state, budgets)

    # Trip condition 2: identical failure signature repeated max_identical_failures times
    if signature:
        sig_hash = hashlib.sha256(signature.encode()).hexdigest()[:16]
        last_sig = state.get("last_failure_signature")
        last_sig_count = state.get("last_failure_signature_count", 0)
        max_identical = budgets.get("max_identical_failures", 2)
        if last_sig == sig_hash:
            new_count = last_sig_count + 1
            if new_count >= max_identical:
                trip(f"Identical failure '{signature[:60]}...' repeated {new_count} times", state, budgets)
            state["last_failure_signature_count"] = new_count
        else:
            state["last_failure_signature"] = sig_hash
            state["last_failure_signature_count"] = 1
        save_state(state)

    # Trip condition 6: no progress (last N iterations did not reduce failing test count)
    no_progress_window = budgets.get("no_progress_window", 3)
    fail_history = state.get("fail_count_history", [])
    if failures and len(fail_history) >= no_progress_window:
        window = fail_history[-no_progress_window:]
        if all(f >= failures for f in window):
            trip(f"No progress: failing test count has not decreased in {no_progress_window} iterations", state, budgets)
    if failures:
        fail_history.append(failures)
        state["fail_count_history"] = fail_history[-10:]  # keep last 10
        save_state(state)

    print("breaker OK")
    sys.exit(0)


def trip_cmd(args):
    trip(getattr(args, "reason", "manual trip"))


def reset_cmd(args):
    state = load(STATE_PATH)
    state["breaker"] = {"tripped": False, "reason": None}
    state.pop("last_failure_signature", None)
    state.pop("last_failure_signature_count", None)
    state.pop("fail_count_history", None)
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    save_state(state)
    print("breaker reset OK")
    sys.exit(0)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd")

    p_check = sub.add_parser("check")
    p_check.add_argument("--stage")
    p_check.add_argument("--failures", type=int, default=0)
    p_check.add_argument("--signature")

    p_trip = sub.add_parser("trip")
    p_trip.add_argument("--reason", required=True)

    sub.add_parser("reset")

    args = parser.parse_args()
    if args.cmd == "check":
        check_cmd(args)
    elif args.cmd == "trip":
        trip_cmd(args)
    elif args.cmd == "reset":
        reset_cmd(args)
    else:
        parser.print_help()
        sys.exit(2)


if __name__ == "__main__":
    main()
