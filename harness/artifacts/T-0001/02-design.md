---
status: pending
owner: designer
task: T-0001
inputs: ["harness/artifacts/T-0001/01-spec.md"]
acceptance_refs: ["AC-004-a"]
---

# 02-design: Action Catalog Schema & Types (T-0001)

## Data Model & Types

```typescript
export type ActionScope = "outdoor" | "indoor" | "cooking" | "commute" | "lifestyle";
export type ActionCostTier = "free" | "low" | "medium" | "high";

export interface CatalogAction {
  id: string;
  title: string;
  description: string;
  scope: ActionScope;
  efficiency: number; // 0.0 to 1.0 (PM2.5 reduction efficiency)
  costTier: ActionCostTier;
  approximateCostInr?: number;
  tags: string[];
}

export interface ValidateActionsResult {
  validActions: CatalogAction[];
  droppedIds: string[];
  isEmpty: boolean;
  errorCode?: "MODEL_EMPTY";
}
```
