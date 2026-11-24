---
status: complete
owner: tech-lead
task: T-0002
inputs: ["harness/artifacts/T-0002/01-spec.md", "harness/artifacts/T-0002/02-design.md"]
acceptance_refs: ["AC-005-a", "AC-005-b", "AC-005-c"]
---

# 03-plan: Impact Implementation & Lane Split (T-0002)

## Lane Assignment
- **Lane**: `lane-data`
- **File ownership**: `src/lib/impact.ts`

## Test Plan (Tests-First)
1. AC-005-a: Single N95 mask action (`eff=0.6`) with 4 outdoor hours -> outdoor reduction fraction is 0.60, overall exposure reduction percentage strictly matches `(4/24 * 0.60 * outdoorPM25) / baselineExposure * 100`.
2. AC-005-b: `outdoorPM25 = 0` -> `reductionPercentage = 0`, `cigarettesSavedPerDay = 0`, no NaNs.
3. AC-005-c: Stacking 3 indoor actions (0.50 HEPA + 0.40 DIY + 0.25 seal) -> multiplicative formula `1 - (1-0.5)*(1-0.4)*(1-0.25) = 1 - 0.225 = 0.775`. Stacking extreme actions caps at `0.90`.
4. Clamping: outdoor hours < 0 or > 24 are clamped to [0, 16].
