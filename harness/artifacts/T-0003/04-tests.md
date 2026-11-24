---
status: complete
owner: test-author
task: T-0003
inputs: ["harness/artifacts/T-0003/01-spec.md", "harness/artifacts/T-0003/03-plan.md"]
acceptance_refs: ["AC-007-a", "AC-009-a", "AC-009-b"]
---

# 04-tests: Sanitizer & Rate Limiter Tests (T-0003)

## AC to Test Matrix
| AC ID | Test Case | File | Status |
|---|---|---|---|
| AC-007-a | validateGeminiKey returns NO_KEY or BAD_KEY | `tests/sanitize.test.ts` | RED (failing before build) |
| AC-009-a | 8 req/min rate limit rejects 9th request | `tests/sanitize.test.ts` | RED (failing before build) |
| AC-009-b | checkPayloadSize rejects > 8 KB | `tests/sanitize.test.ts` | RED (failing before build) |

## Red Run Evidence
```
bun test tests/sanitize.test.ts:
error: Cannot find module '../src/lib/sanitize' from 'tests/sanitize.test.ts'
0 pass, 1 fail
```
Failed for the right reason: implementation files not yet created.
