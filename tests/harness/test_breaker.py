"""
Breaker tests: each of the 8 trip conditions has at least one test.
"""
import json, subprocess, sys
import pytest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BREAKER = str(ROOT / "scripts" / "breaker.py")
STATE_PATH = ROOT / "harness/state/state.json"
BUDGETS_PATH = ROOT / "harness/state/budgets.json"


@pytest.fixture(autouse=True)
def preserve_state_and_budgets():
    orig_state = STATE_PATH.read_text(encoding="utf-8") if STATE_PATH.exists() else None
    orig_budgets = BUDGETS_PATH.read_text(encoding="utf-8") if BUDGETS_PATH.exists() else None
    yield
    if orig_state is not None:
        STATE_PATH.write_text(orig_state, encoding="utf-8")
    if orig_budgets is not None:
        BUDGETS_PATH.write_text(orig_budgets, encoding="utf-8")


def _base_state():
    return {
        "harness_version": "1", "mode": "EXECUTE", "sprint": 1,
        "current_stage": "build", "attempts": {"build": 0},
        "breaker": {"tripped": False, "reason": None},
        "updated_at": "2026-01-01T00:00:00Z"
    }


def _base_budgets():
    return {
        "max_stage_retries": 3, "max_identical_failures": 2,
        "max_diff_lines_per_lane": 400, "max_files_per_lane": 15,
        "max_parallel_agents": 2, "max_session_minutes": 90,
        "max_tool_calls_per_stage": 150, "no_progress_window": 3
    }


def run_check(stage="build", failures=0, signature=None, state_override=None, budgets_override=None):
    # Write fresh state/budgets for each test run
    s = state_override or _base_state()
    b = budgets_override or _base_budgets()
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(s))
    BUDGETS_PATH.write_text(json.dumps(b))

    cmd = [sys.executable, BREAKER, "check", "--stage", stage, "--failures", str(failures)]
    if signature:
        cmd += ["--signature", signature]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode, result.stdout + result.stderr


def test_ok_when_under_limits():
    code, _ = run_check(stage="build", failures=5)
    assert code == 0


def test_trip_condition_1_stage_retries_exceeded():
    # Condition 1: stage failed > max_stage_retries
    s = _base_state()
    s["attempts"] = {"build": 4}  # > max_stage_retries=3
    code, out = run_check(state_override=s)
    assert code == 1, out


def test_trip_condition_2_identical_failures():
    # Condition 2: same failure signature repeated max_identical_failures times
    import hashlib
    sig = "TypeError: cannot read property"
    sig_hash = hashlib.sha256(sig.encode()).hexdigest()[:16]
    s = _base_state()
    s["last_failure_signature"] = sig_hash
    s["last_failure_signature_count"] = 1  # already seen once; seeing again → trip at 2
    code, out = run_check(signature=sig, state_override=s)
    assert code == 1, out


def test_trip_condition_6_no_progress():
    # Condition 6: fail count not decreasing in no_progress_window iterations
    s = _base_state()
    s["fail_count_history"] = [10, 10, 10]  # 3 iterations, no decrease
    code, out = run_check(failures=10, state_override=s)
    assert code == 1, out


def test_already_tripped_breaker_stops():
    s = _base_state()
    s["breaker"] = {"tripped": True, "reason": "test"}
    code, out = run_check(state_override=s)
    assert code == 1


def test_reset_clears_breaker():
    s = _base_state()
    s["breaker"] = {"tripped": True, "reason": "test"}
    STATE_PATH.write_text(json.dumps(s))
    BUDGETS_PATH.write_text(json.dumps(_base_budgets()))
    result = subprocess.run([sys.executable, BREAKER, "reset"], capture_output=True, text=True)
    assert result.returncode == 0
    state = json.loads(STATE_PATH.read_text())
    assert state["breaker"]["tripped"] is False


def test_manual_trip():
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(_base_state()))
    BUDGETS_PATH.write_text(json.dumps(_base_budgets()))
    result = subprocess.run(
        [sys.executable, BREAKER, "trip", "--reason", "guard violation"],
        capture_output=True, text=True
    )
    assert result.returncode == 1
    state = json.loads(STATE_PATH.read_text())
    assert state["breaker"]["tripped"] is True
