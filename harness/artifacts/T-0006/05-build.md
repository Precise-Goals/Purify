---
status: complete
owner: builder
task: T-0006
inputs: ["harness/artifacts/T-0006/03-plan.md", "harness/artifacts/T-0006/04-tests.md"]
acceptance_refs: ["AC-001-a", "AC-003-a", "AC-004-a", "AC-005-a", "AC-007-a", "AC-009-a", "AC-009-b"]
---

# 05-build: Pipeline & Route Implementation (T-0006)

## Files Created / Modified
- `src/lib/pipeline.ts`: 5-stage pipeline runner (AQI -> Prompt -> Gemini -> Catalog Validate -> Impact) returning full plan and stage timing traces.
- `src/app/api/plan/route.ts`: POST route with client IP rate limiting (8 req/min), `x-gemini-key` header verification, 8 KB body cap, and structured error responses.
- `src/app/api/health/route.ts`: GET endpoint returning 200 OK for Docker/Cloud Run container health probes.
- `tests/pipeline.test.ts`: 4 test cases verifying full pipeline assembly, health check, 401 NO_KEY, and 413 BODY_TOO_LARGE.

## Checks Run
- `bun test tests/pipeline.test.ts`: 4 passed [281ms]
- `bun run typecheck`: clean (0 errors)
- `python scripts/guard_paths.py --role builder`: clean (0 violations)
