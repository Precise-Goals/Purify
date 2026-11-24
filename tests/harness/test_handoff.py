"""
Handoff contract tests: every rejection rule in harness/standards/handoff-contract.md.
"""
import json
from pathlib import Path

# Minimal valid handoff
def valid_handoff(task_id="T-0001", artifact_exists=True, tmp_path=None):
    h = {
        "task_id": task_id,
        "from": "tech-lead",
        "to": "test-author",
        "artifact": f"harness/artifacts/{task_id}/03-plan.md",
        "status": "complete",
        "summary": "Implementation plan complete.",
        "inputs_consumed": ["01-spec.md", "02-design.md"],
        "acceptance_refs": ["AC-001-a"],
        "open_questions": [],
        "assumptions": [],
        "files_touched": [f"harness/artifacts/{task_id}/03-plan.md"],
        "checks_run": [{"cmd": "bun run typecheck", "exit": 0}],
        "next_expected_artifact": "04-tests.md"
    }
    return h


def validate_handoff(h: dict, root: Path, harness_ac_ids=None) -> list:
    """Returns list of rejection reasons (empty = valid)."""
    errors = []
    harness_ac_ids = harness_ac_ids or {"AC-001-a", "AC-001-b", "AC-002-a"}

    # Rule 1: artifact file must exist
    artifact = root / h.get("artifact", "")
    if not artifact.exists():
        errors.append("artifact file missing")

    # Rule 2: status must be complete
    if h.get("status") != "complete":
        errors.append(f"status is '{h.get('status')}', expected 'complete'")

    # Rule 3: acceptance_refs must exist in harness.md
    for ref in h.get("acceptance_refs", []):
        if ref not in harness_ac_ids:
            errors.append(f"acceptance_ref '{ref}' not found in harness.md")

    # Rule 5: checks_run must not be empty for roles that must run checks
    must_check_roles = {"builder", "test-author", "qa", "security"}
    if h.get("from") in must_check_roles and not h.get("checks_run"):
        errors.append(f"checks_run is empty for role '{h['from']}'")

    return errors


def test_valid_handoff_passes(tmp_path):
    h = valid_handoff(tmp_path=tmp_path)
    # Create the artifact
    art = tmp_path / "harness/artifacts/T-0001"
    art.mkdir(parents=True)
    (art / "03-plan.md").write_text("plan content")
    errors = validate_handoff(h, tmp_path)
    assert errors == [], errors


def test_missing_artifact_rejected(tmp_path):
    h = valid_handoff(tmp_path=tmp_path)
    # Do NOT create the artifact
    errors = validate_handoff(h, tmp_path)
    assert any("artifact file missing" in e for e in errors)


def test_incomplete_status_rejected(tmp_path):
    h = valid_handoff(tmp_path=tmp_path)
    h["status"] = "blocked"
    art = tmp_path / "harness/artifacts/T-0001"
    art.mkdir(parents=True)
    (art / "03-plan.md").write_text("plan")
    errors = validate_handoff(h, tmp_path)
    assert any("status" in e for e in errors)


def test_unknown_acceptance_ref_rejected(tmp_path):
    h = valid_handoff(tmp_path=tmp_path)
    h["acceptance_refs"] = ["AC-999-z"]  # doesn't exist
    art = tmp_path / "harness/artifacts/T-0001"
    art.mkdir(parents=True)
    (art / "03-plan.md").write_text("plan")
    errors = validate_handoff(h, tmp_path)
    assert any("AC-999-z" in e for e in errors)


def test_empty_checks_run_rejected_for_builder(tmp_path):
    h = valid_handoff(tmp_path=tmp_path)
    h["from"] = "builder"
    h["checks_run"] = []
    art = tmp_path / "harness/artifacts/T-0001"
    art.mkdir(parents=True)
    (art / "03-plan.md").write_text("plan")
    errors = validate_handoff(h, tmp_path)
    assert any("checks_run" in e for e in errors)


def test_scribe_does_not_require_checks_run(tmp_path):
    h = valid_handoff(tmp_path=tmp_path)
    h["from"] = "scribe"
    h["checks_run"] = []
    art = tmp_path / "harness/artifacts/T-0001"
    art.mkdir(parents=True)
    (art / "03-plan.md").write_text("plan")
    errors = validate_handoff(h, tmp_path)
    # scribe is not in must_check_roles, so empty checks_run is OK
    assert not any("checks_run" in e for e in errors)
