---
status: complete
owner: designer
task: T-0002
inputs: ["harness/artifacts/T-0002/01-spec.md"]
acceptance_refs: ["AC-005-a", "AC-005-b", "AC-005-c"]
---

# 02-design: Impact Model Types & Interfaces (T-0002)

## Interfaces

```typescript
export interface ImpactProfile {
  outdoorHours: number; // typically 0 to 16
  outdoorPM25: number;   // ug/m3
  hasExistingPurifier?: boolean;
  homeType?: "sealed" | "standard" | "leaky";
}

export interface ImpactBreakdown {
  outdoorReductionFraction: number; // 0.0 to 0.90
  indoorReductionFraction: number;  // 0.0 to 0.90
  cookingReductionFraction: number; // 0.0 to 0.90
}

export interface ImpactResult {
  baselineExposurePM25: number;
  mitigatedExposurePM25: number;
  reductionPercentage: number;
  baselineCigaretteEquivalents: number;
  mitigatedCigaretteEquivalents: number;
  cigarettesSavedPerDay: number;
  annualCigarettesAvoided: number;
  co2SavedKgPerMonth: number;
  caveat: string;
  breakdown: ImpactBreakdown;
}
```
