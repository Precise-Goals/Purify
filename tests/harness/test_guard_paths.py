"""Guard paths tests: role writes outside allow-list → non-zero exit."""
import subprocess, sys, json
from pathlib import Path

GUARD = str(Path(__file__).resolve().parents[2] / "scripts" / "guard_paths.py")


def run_guard(role, paths):
    result = subprocess.run(
        [sys.executable, GUARD, "--role", role],
        input="\n".join(paths),
        capture_output=True, text=True
    )
    return result.returncode, result.stdout + result.stderr


def test_builder_allowed_in_src(tmp_path):
    code, out = run_guard("builder", ["src/lib/catalog.ts"])
    assert code == 0, out


def test_builder_blocked_from_docs(tmp_path):
    code, out = run_guard("builder", ["docs/harness.md"])
    assert code != 0, out


def test_orchestrator_can_write_state(tmp_path):
    code, out = run_guard("orchestrator", ["harness/state/state.json"])
    assert code == 0, out


def test_orchestrator_cannot_write_src(tmp_path):
    code, out = run_guard("orchestrator", ["src/lib/catalog.ts"])
    assert code != 0, out


def test_scribe_can_write_docs(tmp_path):
    code, out = run_guard("scribe", ["docs/memory/lessons.md"])
    assert code == 0, out


def test_scribe_cannot_write_src(tmp_path):
    code, out = run_guard("scribe", ["src/lib/catalog.ts"])
    assert code != 0, out


def test_raw_md_always_forbidden_even_for_orchestrator(tmp_path):
    code, out = run_guard("orchestrator", ["docs/raw.md"])
    assert code != 0, out


def test_unknown_role_exits_with_code_2(tmp_path):
    result = subprocess.run(
        [sys.executable, GUARD, "--role", "hacker"],
        input="src/evil.ts", capture_output=True, text=True
    )
    assert result.returncode == 2
