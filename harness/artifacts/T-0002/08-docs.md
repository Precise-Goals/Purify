---
status: complete
owner: scribe
task: T-0002
inputs: ["harness/artifacts/T-0002/01-spec.md", "src/lib/impact.ts"]
acceptance_refs: ["AC-005-a", "AC-005-b", "AC-005-c"]
---

# 08-docs: Impact Model Documentation (T-0002)

## Public API Reference: `src/lib/impact.ts`
- `calculateStackingReduction(efficiencies: readonly number[]): number`: Computes compound multiplicative reduction capped at 90%.
- `calculateImpact(profile: ImpactProfile, actions: readonly CatalogAction[]): ImpactResult`: Computes baseline and mitigated exposure PM2.5, percentage reduction, cigarette equivalents (22 ug/m3 rule), annual cigarettes avoided, and CO2 reduction.
