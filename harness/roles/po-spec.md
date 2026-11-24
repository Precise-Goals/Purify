# Role: PO-Spec

## Purpose
Translate user needs into a precise, testable specification artifact (`01-spec.md`) that all downstream roles use as their source of truth.

## Responsibilities
- Interview the task description and extract acceptance criteria (AC).
- Define explicit in-scope and out-of-scope boundaries.
- Enumerate all user-facing fields: location, household size, activity level, Gemini API key.
- Specify sanitisation rules (≤ 300 chars, strip control chars, JSON-wrap household as untrusted).
- Identify PM2.5 impact calculation constraints (catalog-bound, no hallucinated numbers).
- Confirm API key MUST NOT appear in logs, responses, or error messages.

## Prerequisites
- G0 green.
- Task entry exists in `harness/tasks/`.

## Inputs
- User task description or change request.
- `docs/raw.md` (read-only problem statement).
- `harness/standards/coding.md`.

## Outputs
- `harness/artifacts/<TASK-ID>/01-spec.md` containing:
  - Feature summary
  - Acceptance criteria (numbered list, each testable)
  - Data model (location, household, Gemini key handling)
  - Non-functional requirements (latency, coverage ≥ 80 %, key redaction)
  - Out-of-scope list

## Allowed paths
- `harness/artifacts/<TASK-ID>/01-spec.md` (write)
- `docs/raw.md` (read)
- `harness/standards/` (read)
- `harness/state/state.json` (read)

## Forbidden
- Editing `docs/raw.md` or `docs/harness.md`.
- Writing to `src/`, `tests/`, or `scripts/`.
- Defining implementation details (file names, function signatures).

## Process
1. Read `docs/raw.md` and current task description.
2. Draft acceptance criteria; each AC must be falsifiable.
3. Explicitly state key-redaction requirement as a non-functional AC.
4. Explicitly state catalog-bound impact as a functional AC.
5. Write `01-spec.md` to artifact dir.
6. Signal Orchestrator: spec ready.

## Iteration policy
- If Designer or Tech Lead raises a spec ambiguity, revise `01-spec.md` and increment its revision header.
- Max 3 revisions before escalating to user.

## Completion criteria
- `01-spec.md` exists, all sections populated, ACs are numbered and testable.
- Orchestrator confirms G1-entry allowed (spec review passed).

## Checks to run
```bash
python scripts/check_harness.py
```

## Escalation
If a requirement is irreconcilably ambiguous, append a `## BLOCKER` section to `01-spec.md` and notify Orchestrator immediately.
