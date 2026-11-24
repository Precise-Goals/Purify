---
status: complete
owner: test-author
task: T-0004
inputs: ["harness/artifacts/T-0004/01-spec.md", "harness/artifacts/T-0004/03-plan.md"]
acceptance_refs: ["AC-001-a", "AC-001-b", "AC-001-c", "AC-007-c", "AC-014-a"]
---

# 04-tests: Air Quality Engine Tests (T-0004)

## AC to Test Matrix
| AC ID | Test Case | File | Status |
|---|---|---|---|
| AC-001-a | Fetches from Google AQ API when key provided | `tests/aqi.test.ts` | RED (failing before build) |
| AC-001-b | Falls back to Open-Meteo when Google fails | `tests/aqi.test.ts` | RED (failing before build) |
| AC-001-c | Direct lat/lon geocoding pass-through | `tests/aqi.test.ts` | RED (failing before build) |
| AC-007-c | Throws AQI_UNAVAILABLE if both providers fail | `tests/aqi.test.ts` | RED (failing before build) |
| AC-014-a | Categorizes AQI and flags severe hazard (≥300) | `tests/aqi.test.ts` | RED (failing before build) |

## Red Run Evidence
```
bun test tests/aqi.test.ts:
error: Cannot find module '../src/lib/aqi' from 'tests/aqi.test.ts'
0 pass, 1 fail
```
Fails as expected because `src/lib/aqi.ts` has not yet been authored.
