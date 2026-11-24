---
status: complete
owner: scribe
task: T-0004
inputs: ["harness/artifacts/T-0004/01-spec.md", "src/lib/aqi.ts"]
acceptance_refs: ["AC-001-a", "AC-001-b", "AC-001-c", "AC-007-c", "AC-014-a"]
---

# 08-docs: Air Quality Documentation (T-0004)

## Public API Reference: `src/lib/aqi.ts`
- `fetchAirQuality(query, options)`: Resolves location and fetches live PM2.5/AQI from Google AQ API (with Open-Meteo fallback) and 10-minute caching.
- `geocodeLocation(query, fetchFn)`: Resolves text location or lat/lon to canonical coordinates.
- `categorizeAQI(aqi)`: Returns US EPA AQI category and attaches medical escalation advisory when AQI ≥ 300.
