---
status: complete
owner: po-spec
task: T-0002
inputs: ["harness/tasks/T-0002.md", "docs/harness.md", "docs/raw.md"]
acceptance_refs: ["AC-005-a", "AC-005-b", "AC-005-c"]
---

# 01-spec: Deterministic PM2.5 Impact Model (T-0002)

## Problem & Background
Raw AQI numbers do not convey concrete health outcomes to families. To make the benefits of interventions transparent, BreatheWise calculates individual exposure (outdoor + indoor time-weighted), reductions from selected actions, and cigarette-equivalents saved. All numbers are computed by deterministic code to eliminate AI hallucinations.

## Key Formulas
1. `infiltration`: 0.60 for leaky/standard home, 0.36 if home already has an air purifier.
2. `outdoorHours`: clamped to [0, 16], indoorHours = `24 - outdoorHours`.
3. `baselineExposure = (outdoorHours * outdoorPM25 + indoorHours * outdoorPM25 * infiltration) / 24`
4. Multiplicative stacking per scope: `scopeReduction = min(0.90, 1 - Product(1 - eff_i))`
5. `mitigatedExposure = (outdoorHours * outdoorPM25 * (1 - outdoorRed) + indoorHours * outdoorPM25 * infiltration * (1 - indoorRed)) / 24`
6. `reductionPercent`: 0% if `baselineExposure <= 0`, else `((baselineExposure - mitigatedExposure) / baselineExposure) * 100`
7. `cigarettesSaved`: `max(0, (baselineExposure - mitigatedExposure) / 22.0)`

## Acceptance Mapping
- AC-005-a: N95 outdoor action exposure reduction strictly matches `0.60 * (outdoorHours / 24)`.
- AC-005-b: Zero PM2.5 results in 0.0% reduction without NaN or divide-by-zero.
- AC-005-c: Multiple same-scope actions multiply without double-counting; capped at 90%.
