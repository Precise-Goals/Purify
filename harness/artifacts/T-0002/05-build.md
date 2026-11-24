---
status: complete
owner: builder
task: T-0002
inputs: ["harness/artifacts/T-0002/03-plan.md", "harness/artifacts/T-0002/04-tests.md"]
acceptance_refs: ["AC-005-a", "AC-005-b", "AC-005-c"]
---

# 05-build: Deterministic Impact Model Implementation (T-0002)

## Files Created / Modified
- `src/lib/impact.ts`: Deterministic impact formulas, indoor/outdoor time-weighting, multiplicative stacking with 90% benefit cap, Berkeley Earth cigarette equivalents (22 ug/m3), CO2 estimation, and medical disclaimer caveat.
- `tests/impact.test.ts`: 8 unit tests covering all edge cases (zero PM2.5, extreme stacking, outdoor-hour clamping, exact fractional reductions).

## Checks Run
- `bun test tests/impact.test.ts`: 8 passed [23ms]
- `bun run typecheck`: clean (0 errors)
- `python scripts/guard_paths.py --role builder`: clean (0 violations)
