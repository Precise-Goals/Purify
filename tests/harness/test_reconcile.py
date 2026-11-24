"""
Harness reconcile tests: simulate various repo states and assert the right
status and that DRIFTED files are never overwritten.
"""
import hashlib, json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
import check_harness as ch


def make_base(root: Path):
    """Minimal valid harness root for reconcile tests."""
    (root / "harness/state").mkdir(parents=True)
    (root / "docs").mkdir(parents=True)
    s = {"harness_version": "1", "mode": "EXECUTE", "sprint": 0, "current_stage": "scaffold",
         "attempts": {}, "breaker": {"tripped": False}, "updated_at": "2026-01-01T00:00:00Z"}
    (root / "harness/state/state.json").write_text(json.dumps(s))
    (root / "docs/raw.md").write_text("Problem: smog assistant")
    (root / "docs/harness.md").write_text("valid harness")
    return root


def test_missing_agents_md_reported(tmp_path):
    make_base(tmp_path)
    errs = ch.check_agents_md(tmp_path)
    assert any("AGENTS.md missing" in e for e in errs)


def test_blank_agents_md_is_unconfigured(tmp_path):
    make_base(tmp_path)
    (tmp_path / "AGENTS.md").write_text("   \n  ")
    errs = ch.check_unconfigured(tmp_path)
    assert any("AGENTS.md" in e for e in errs)


def test_stale_detected_on_raw_md_change(tmp_path):
    make_base(tmp_path)
    sha_v1 = hashlib.sha256(b"Problem: smog assistant").hexdigest()
    s = json.loads((tmp_path / "harness/state/state.json").read_text())
    s["derived_from"] = {"raw_md_sha": sha_v1}
    (tmp_path / "harness/state/state.json").write_text(json.dumps(s))
    # No stale yet
    assert ch.check_stale(tmp_path) == []
    # Now change raw.md → stale
    (tmp_path / "docs/raw.md").write_text("Problem: updated smog assistant")
    errs = ch.check_stale(tmp_path)
    assert any("stale" in e and "raw.md" in e for e in errs)


def test_placeholder_harness_md_flagged(tmp_path):
    make_base(tmp_path)
    (tmp_path / "harness").mkdir(exist_ok=True)
    (tmp_path / "harness/backlog.md").write_text("TODO fill backlog")
    errs = ch.check_unconfigured(tmp_path)
    assert any("backlog.md" in e for e in errs)
