---
status: complete
owner: test-author
task: T-0007
inputs: ["harness/artifacts/T-0007/01-spec.md", "harness/artifacts/T-0007/03-plan.md"]
acceptance_refs: ["AC-011-a", "AC-011-b", "AC-014-a"]
---

# 04-tests: UI Component Tests (T-0007)

## AC to Test Matrix
| AC ID | Test Case | File | Status |
|---|---|---|---|
| AC-014-a | Color mapping & hazard styles for AQI categories | `tests/ui.test.ts` | RED (failing before build) |

## Red Run Evidence
```
bun test tests/ui.test.ts:
error: Cannot find module '../src/components/AqiBadge' from 'tests/ui.test.ts'
0 pass, 1 fail
```
Fails as expected because UI components have not yet been built.
