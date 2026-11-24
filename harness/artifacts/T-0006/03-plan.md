---
status: complete
owner: tech-lead
task: T-0006
inputs: ["harness/artifacts/T-0006/01-spec.md", "harness/artifacts/T-0006/02-design.md"]
acceptance_refs: ["AC-001-a", "AC-003-a", "AC-004-a", "AC-005-a", "AC-007-a", "AC-009-a", "AC-009-b"]
---

# 03-plan: Pipeline & Route Implementation Plan (T-0006)

## Lane Assignment
- **Lane**: `lane-api`
- **Files**:
  - `src/lib/pipeline.ts`
  - `src/app/api/plan/route.ts`
  - `src/app/api/health/route.ts`

## Test Strategy (Tests-First)
- `tests/pipeline.test.ts`: Test full end-to-end pipeline execution with injected mock services.
  - Stage execution order and timings in trace.
  - Verification that unknown IDs are dropped and valid IDs produce non-zero impact.
  - Error propagation (`MODEL_EMPTY`, `QUOTA`, `NO_KEY`, `AQI_UNAVAILABLE`).
- Route tests via Next.js `Request` / `POST` / `GET` invocations.
