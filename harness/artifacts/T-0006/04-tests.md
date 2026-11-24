---
status: complete
owner: test-author
task: T-0006
inputs: ["harness/artifacts/T-0006/01-spec.md", "harness/artifacts/T-0006/03-plan.md"]
acceptance_refs: ["AC-001-a", "AC-003-a", "AC-004-a", "AC-005-a", "AC-007-a", "AC-009-a", "AC-009-b"]
---

# 04-tests: Pipeline & Route Tests (T-0006)

## AC to Test Matrix
| AC ID | Test Case | File | Status |
|---|---|---|---|
| AC-001-a, AC-003-a | End-to-end pipeline execution with telemetry trace | `tests/pipeline.test.ts` | RED (failing before build) |
| AC-007-a | POST /api/plan returns 401 NO_KEY | `tests/pipeline.test.ts` | RED (failing before build) |
| AC-009-b | POST /api/plan returns 413 BODY_TOO_LARGE | `tests/pipeline.test.ts` | RED (failing before build) |
| Container Health | GET /api/health returns 200 OK | `tests/pipeline.test.ts` | RED (failing before build) |

## Red Run Evidence
```
bun test tests/pipeline.test.ts:
error: Cannot find module '../src/lib/pipeline' from 'tests/pipeline.test.ts'
0 pass, 1 fail
```
Failed for the right reason: pipeline and route handlers not yet authored.
