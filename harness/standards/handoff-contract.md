<!-- generated-by: harness v1 | source: harness.md -->
# Handoff Contract

Every handoff between agents is a JSON file at `harness/artifacts/<TASK-ID>/handoff-<from>-to-<to>.json`.

## Required fields
```json
{
  "task_id": "T-0001",
  "from": "<role>",
  "to": "<role>",
  "artifact": "harness/artifacts/T-0001/<artifact>.md",
  "status": "complete | blocked | needs-info",
  "summary": "≤ 120 words describing what was done",
  "inputs_consumed": ["<file>", "..."],
  "acceptance_refs": ["AC-001-a", "..."],
  "open_questions": [],
  "assumptions": [],
  "files_touched": ["<path>", "..."],
  "checks_run": [{"cmd": "<command>", "exit": 0}],
  "next_expected_artifact": "<artifact>.md"
}
```

## Rejection rules (Orchestrator rejects if any):
1. Artifact file is missing.
2. `status != "complete"`.
3. An `acceptance_refs` ID does not exist in `docs/harness.md`.
4. `files_touched` contains paths outside the role's allow-list.
5. `checks_run` is empty for roles that must run checks (Builder, Test Author, QA, Security).
