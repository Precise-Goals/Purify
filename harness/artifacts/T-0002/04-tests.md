---
status: complete
owner: test-author
task: T-0002
inputs: ["harness/artifacts/T-0002/01-spec.md", "harness/artifacts/T-0002/03-plan.md"]
acceptance_refs: ["AC-005-a", "AC-005-b", "AC-005-c"]
---

# 04-tests: Deterministic Impact Model Tests (T-0002)

## AC to Test Matrix
| AC ID | Test Case | File | Status |
|---|---|---|---|
| AC-005-a | N95 outdoor reduction matches outdoor-hour weighting | `tests/impact.test.ts` | RED (failing before build) |
| AC-005-b | Zero PM2.5 handles safely without divide-by-zero or NaN | `tests/impact.test.ts` | RED (failing before build) |
| AC-005-c | Multiplicative stacking and 90% benefit cap | `tests/impact.test.ts` | RED (failing before build) |

## Red Run Evidence
```
bun test tests/impact.test.ts:
error: Cannot find module '../src/lib/impact' from 'tests/impact.test.ts'
0 pass, 1 fail
```
Fails as expected because `src/lib/impact.ts` has not yet been authored.
