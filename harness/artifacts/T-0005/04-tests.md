---
status: complete
owner: test-author
task: T-0005
inputs: ["harness/artifacts/T-0005/01-spec.md", "harness/artifacts/T-0005/03-plan.md"]
acceptance_refs: ["AC-003-a", "AC-003-b", "AC-007-b"]
---

# 04-tests: Gemini Client & Resilience Tests (T-0005)

## AC to Test Matrix
| AC ID | Test Case | File | Status |
|---|---|---|---|
| AC-003-a | Gemini structured plan parsed on HTTP 200 | `tests/gemini.test.ts` | RED (failing before build) |
| AC-003-b | Single retry on 5xx before throwing GEMINI_FAIL | `tests/gemini.test.ts` | RED (failing before build) |
| AC-007-b | 429 quota throws QUOTA with no retry storm | `tests/gemini.test.ts` | RED (failing before build) |

## Red Run Evidence
```
bun test tests/gemini.test.ts:
error: Cannot find module '../src/lib/gemini' from 'tests/gemini.test.ts'
0 pass, 1 fail
```
Failed for the right reason: implementation file not yet created.
