---
status: complete
owner: designer
task: T-0006
inputs: ["harness/artifacts/T-0006/01-spec.md"]
acceptance_refs: ["AC-001-a", "AC-003-a", "AC-004-a", "AC-005-a"]
---

# 02-design: Pipeline Architecture & Types (T-0006)

```typescript
export interface PipelineTrace {
  stages: {
    aqiMs: number;
    geminiMs: number;
    validateMs: number;
    impactMs: number;
  };
  totalMs: number;
}

export interface PlanResponse {
  air: AirQualityData;
  plan: {
    summary: string;
    actions: CatalogAction[];
    droppedActionIds: string[];
    dailyRoutineTips: string[];
    language?: string;
  };
  impact: ImpactResult;
  trace: PipelineTrace;
}
```
