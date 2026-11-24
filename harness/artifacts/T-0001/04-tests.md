---
status: complete
owner: test-author
task: T-0001
inputs: ["harness/artifacts/T-0001/01-spec.md", "harness/artifacts/T-0001/03-plan.md"]
acceptance_refs: ["AC-004-a"]
---

# 04-tests: Curated Action Catalog Tests (T-0001)

## AC to Test Matrix
| AC ID | Test Case | File | Status |
|---|---|---|---|
| AC-004-a | drops unknown/hallucinated IDs | `tests/catalog.test.ts` | RED (failing before build) |
| AC-004-a | returns MODEL_EMPTY if all action IDs invalid | `tests/catalog.test.ts` | RED (failing before build) |
| AC-004-a | returns valid catalog actions for valid IDs | `tests/catalog.test.ts` | RED (failing before build) |
| AC-004-a | deduplicates repeated valid action IDs | `tests/catalog.test.ts` | RED (failing before build) |

## Red Run Evidence
```
bun test v1.4.4 (38afee6c8)
tests/catalog.test.ts:
error: Cannot find module '../src/lib/catalog' from 'tests/catalog.test.ts'
0 pass, 1 fail
```
Tests failed for the expected reason: implementation does not exist yet.
