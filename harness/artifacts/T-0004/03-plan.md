---
status: complete
owner: tech-lead
task: T-0004
inputs: ["harness/artifacts/T-0004/01-spec.md", "harness/artifacts/T-0004/02-design.md"]
acceptance_refs: ["AC-001-a", "AC-001-b", "AC-001-c", "AC-007-c", "AC-014-a"]
---

# 03-plan: Air Quality Implementation & Testing Plan (T-0004)

## Lane Assignment
- **Lane**: `lane-data`
- **File**: `src/lib/aqi.ts`

## Implementation Steps
1. Pure category calculation from AQI:
   - 0–50: Good
   - 51–100: Moderate
   - 101–150: UnhealthyForSensitiveGroups
   - 151–200: Unhealthy
   - 201–300: VeryUnhealthy
   - >300: Hazardous (`isSevereHazard = true`)
2. In-memory `Map<string, { data: AirQualityData; expiresAt: number }>` with 10-minute TTL.
3. Injected `fetchFn?: typeof fetch` parameter for all fetch methods.
4. Pre-seeded fallback coordinates for major Indo-Gangetic and East Asian smog hubs (Delhi, Mumbai, Beijing, Lahore, Dhaka, Kolkata).
5. Comprehensive tests for:
   - Google success
   - Google failure -> Open-Meteo success (source="open-meteo")
   - Both failure -> `AQI_UNAVAILABLE`
   - Cache hit within 10 minutes
   - AQI >= 300 medical advisory
