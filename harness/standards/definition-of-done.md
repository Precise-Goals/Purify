<!-- generated-by: harness v1 | source: harness.md -->
# Definition of Done — BreatheWise

A task is **Done** only when **all** checkboxes below are true:

- [ ] Artifacts `01-spec.md` through `08-docs.md` exist for the task and every handoff JSON validated by Orchestrator
- [ ] G0–G4 all pass with logged evidence (commands + exit codes) in `harness/logs/events.jsonl`
- [ ] Every `AC-*` referenced in the task has ≥ 1 passing test (`bun test`) or recorded manual evidence
- [ ] `bun run verify` exits 0 (typecheck + tests + size + build)
- [ ] No new lint/type warnings; no skipped/xfail tests added; coverage ≥ 80% on changed lines
- [ ] Reviewer: 0 BLOCKER/MAJOR findings in `06-review.md`
- [ ] Security: 0 high/critical findings in `06b-security.md`; semgrep clean; no secret patterns in diff
- [ ] Scribe: docs updated in `08-docs.md`; README/CHANGELOG current
- [ ] Guard clean: `python scripts/guard_paths.py` exits 0
- [ ] No breaker tripped (`harness/state/state.json`.breaker.tripped = false)
- [ ] No unresolved open questions in `docs/harness.md §15`
- [ ] `harness/state/state.json`, logs, and `docs/memory/lessons.md` updated
- [ ] Commit follows `harness/standards/git.md` (conventional commits, signed if required)
- [ ] `AGENTS.md` still accurate (Librarian verified, ≤ 150 lines, all links resolve)
