---
status: complete
owner: scribe
task: T-0001
inputs: ["harness/artifacts/T-0001/01-spec.md", "src/lib/catalog.ts"]
acceptance_refs: ["AC-004-a"]
---

# 08-docs: Catalog Documentation (T-0001)

## Public API Reference: `src/lib/catalog.ts`
- `ACTION_CATALOG`: Read-only array of 11 curated smog actions with verified PM2.5 efficiencies.
- `getActionById(id: string): CatalogAction | undefined`: O(1) lookup.
- `getAllActions(): readonly CatalogAction[]`: Returns full catalog.
- `validateActionIds(rawIds: readonly string[]): ValidateActionsResult`: Sanitizes model-suggested action IDs, drops unrecognized values, and signals `MODEL_EMPTY` if no valid interventions remain.
