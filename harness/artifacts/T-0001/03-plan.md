---
status: pending
owner: tech-lead
task: T-0001
inputs: ["harness/artifacts/T-0001/01-spec.md", "harness/artifacts/T-0001/02-design.md"]
acceptance_refs: ["AC-004-a"]
---

# 03-plan: Catalog Implementation Plan (T-0001)

## Approach
Implement `src/lib/catalog.ts` containing:
1. Pure TypeScript definitions for `CatalogAction`, `ActionScope`, `ActionCostTier`, `ValidateActionsResult`.
2. Authoritative list `ACTION_CATALOG: readonly CatalogAction[]`.
3. Map-based lookup index for O(1) retrieval by ID.
4. Exported functions:
   - `getActionById(id: string): CatalogAction | undefined`
   - `getAllActions(): readonly CatalogAction[]`
   - `validateActionIds(ids: string[]): ValidateActionsResult`

## Lane Decomposition
- **Single lane**: `lane-data` owning `src/lib/catalog.ts`.

## Test Strategy (AC-004-a)
- Test valid action IDs returned intact.
- Test unknown/hallucinated IDs dropped into `droppedIds`.
- Test duplicate IDs deduped.
- Test empty list or all-invalid list returns `isEmpty: true` and `errorCode: "MODEL_EMPTY"`.
- Test efficiency values within [0.0, 1.0].
