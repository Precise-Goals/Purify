---
status: complete
owner: builder
task: T-0004
inputs: ["harness/artifacts/T-0004/03-plan.md", "harness/artifacts/T-0004/04-tests.md"]
acceptance_refs: ["AC-001-a", "AC-001-b", "AC-001-c", "AC-007-c", "AC-014-a"]
---

# 05-build: Air Quality Engine Implementation (T-0004)

## Files Created / Modified
- `src/lib/aqi.ts`: Geocoding (coordinates pass-through, known hubs, Open-Meteo geocoder), Google AQ lookup with Open-Meteo keyless fallback, in-memory 10-minute cache with automatic TTL expiry, and AQI category classification with severe hazard warnings for AQI ≥ 300.
- `tests/aqi.test.ts`: 8 unit test suites with mocked network endpoints testing Google primary, Open-Meteo fallback, caching, dual failure, and hazard escalation.

## Checks Run
- `bun test tests/aqi.test.ts`: 8 passed [25ms]
- `bun run typecheck`: clean (0 errors)
- `python scripts/guard_paths.py --role builder`: clean (0 violations)
