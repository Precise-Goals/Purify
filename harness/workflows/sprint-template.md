<!-- generated-by: harness v1 | source: harness.md -->
# Sprint Template — BreatheWise

## Sprint ceremony (Orchestrator runs)

### 1. Plan
- Pick tasks from `harness/backlog.md` (MoSCoW order).
- Elaborate each into `harness/tasks/<ID>.md` using the template below.
- Confirm scope with user if any task is ambiguous.
- Record sprint goal and task list in `harness/state/state.json`.

### 2. Execute
- Run the pipeline per task (see `harness/workflows/pipeline.md`).
- Parallel lanes where `03-plan.md` grants disjoint ownership.
- G0 before each task; G5 at sprint end.

### 3. Review
- QA verdict + user demo summary recorded in `harness/logs/decisions.log.md`.
- Sprint metrics: tasks delivered vs. planned, gate failures, breaker trips.

### 4. Retro
- Librarian proposes harness changes: role tweaks, new lint rules, new tests.
- Orchestrator applies changes in a dedicated commit: `chore(harness): retro sprint <N>`.
- Re-run G0 (harness self-test).

## Task definition template
```markdown
# T-XXXX — <title>
Backlog ref: <backlog line> · Sprint: <N> · Priority: MUST|SHOULD|COULD

## Intent
(why this task exists; user value)

## Scope / Out of scope
(what is included; what is explicitly excluded)

## Guidance
(how it should / should not work; patterns to reuse)

## Requirements
(REQ-xxx ids from docs/harness.md §4)

## Acceptance
(AC-xxx-y ids from docs/harness.md §5; Given/When/Then)

## Risks / Notes
```

## Exit gate checklist (G5)
- [ ] All task G4 gates passed
- [ ] `bun run verify` exits 0 on the sprint branch
- [ ] Demo checklist items demonstrated to user
- [ ] User replied "approved" (recorded in `harness/logs/decisions.log.md`)
- [ ] `harness/state/state.json` sprint incremented
- [ ] Retro complete; `docs/memory/lessons.md` updated
