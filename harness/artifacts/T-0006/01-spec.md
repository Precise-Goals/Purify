---
status: complete
owner: po-spec
task: T-0006
inputs: ["harness/tasks/T-0006.md", "docs/harness.md", "docs/raw.md §5"]
acceptance_refs: ["AC-001-a", "AC-003-a", "AC-004-a", "AC-005-a", "AC-007-a", "AC-009-a", "AC-009-b", "AC-010-a"]
---

# 01-spec: Pipeline & API Route Specification (T-0006)

## Request Specification: `POST /api/plan`
- **Headers**:
  - `Content-Type: application/json`
  - `x-gemini-key: <string>`
- **Body**: JSON matching `HouseholdProfileInput` (< 8 KB)
- **Response**:
  ```json
  {
    "air": { "aqi": 280, "pm25": 195, ... },
    "plan": { "summary": "...", "actions": [...], "dailyRoutineTips": [...] },
    "impact": { "baselineExposurePM25": 133, "reductionPercentage": 25.5, ... },
    "trace": { "stages": { "aqiMs": 150, "geminiMs": 850, "validateMs": 2, "impactMs": 3 }, "totalMs": 1005 }
  }
  ```

## Health Specification: `GET /api/health`
- **Response**: HTTP 200 `{"status": "healthy", "service": "breathewise", "version": "0.1.0"}`
