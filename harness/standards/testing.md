<!-- generated-by: harness v1 | source: harness.md -->
# Testing Standards — BreatheWise

## Test runner
- **Unit / integration**: `bun test` (Bun's built-in runner). Test files: `*.test.ts`.
- **Harness self-tests**: `pytest tests/harness/` (Python stdlib + pytest).

## Test pyramid
| Layer | Location | Rule |
|---|---|---|
| Unit | `tests/core.test.ts` + `tests/<module>.test.ts` | One file per module; < 1 s each; hermetic |
| Integration | `tests/integration/` | Full pipeline with injected/mocked deps; no real network |
| E2E / smoke | Docker smoke test in CI | `GET /api/health` → 200 in built container |

## Naming convention
- File: `<module>.test.ts` for unit, `<flow>.integration.test.ts` for integration.
- Test name: `describe("<unit>") / it("<behavior when condition>")`

## Hermeticity rules
- No real network calls in unit or integration tests. Mock `fetch` via dependency injection.
- Deterministic: seed all random sources; freeze `Date.now` via injected clock.
- No shared mutable state between tests; each test sets up and tears down its own fixtures.

## Coverage floor
- 80% on **changed lines** (`bun test --coverage`). Measured per PR; enforced at G2.
- 100% coverage of error code paths (NO_KEY, BAD_KEY, QUOTA, AQI_UNAVAILABLE, MODEL_EMPTY, etc.).

## Tests-first discipline
- Test Author writes **failing** tests from AC IDs before Builder writes any implementation.
- The red run (failing test output) is captured in `harness/artifacts/<TASK-ID>/04-tests.md`.
- Builder may not start until `04-tests.md` exists and the handoff is validated.

## Forbidden patterns (Reviewer greps diff for these)
- `test.skip`, `it.skip`, `xit`, `xdescribe` — quarantine and fix within the sprint; never merge.
- Snapshot blind-updates (`--update-snapshots` without reviewing the diff).
- Catching and swallowing errors to make tests pass.
- `// @ts-ignore` or `any` casts in test files.
- `eslint-disable` in test files.

## Flaky tests
- If a test is flaky: quarantine immediately (move to `tests/quarantine/`, do NOT delete), add an entry to `docs/memory/lessons.md`, fix within the sprint.
- Never retry-until-green.

## Impact model tests (required)
- Zero PM2.5 → reduction 0%, no divide-by-zero.
- Multiple same-scope actions → multiplicative stacking, total capped at 90%.
- N95 outdoor action → reduction = efficiency × (outdoorHours/24).
- Duplicate action IDs → counted once.
