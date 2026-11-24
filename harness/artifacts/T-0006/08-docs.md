---
status: complete
owner: scribe
task: T-0006
inputs: ["harness/artifacts/T-0006/01-spec.md", "src/lib/pipeline.ts"]
acceptance_refs: ["AC-001-a", "AC-003-a", "AC-004-a", "AC-005-a"]
---

# 08-docs: Pipeline Documentation (T-0006)

## API Endpoints
- `POST /api/plan`: Generates a personalized smog action plan with live AQI, catalog validation, and deterministic PM2.5 impact. Requires `x-gemini-key` header.
- `GET /api/health`: Health status probe for container readiness and liveness checks.
- `runPipeline(profile, options)`: Core TypeScript engine executing the 5 stages and emitting microsecond-level timing traces.
