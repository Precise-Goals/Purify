---
status: complete
owner: po-spec
task: T-0004
inputs: ["harness/tasks/T-0004.md", "docs/harness.md", "docs/raw.md §5,§9"]
acceptance_refs: ["AC-001-a", "AC-001-b", "AC-001-c", "AC-007-c", "AC-014-a"]
---

# 01-spec: Air Quality Engine & Fallback (T-0004)

## Architecture
1. **Input resolution**:
   - If `latitude` and `longitude` are present, use directly.
   - If only `city` is present, geocode to `(lat, lon, displayName)`.
2. **Cache Check**:
   - Key: `${lat.toFixed(2)},${lon.toFixed(2)}`.
   - TTL: 10 minutes (600,000 ms).
   - If hit and not expired, return cached value with `source = "cache"`.
3. **Primary Fetch (Google Air Quality API)**:
   - Endpoint: `https://airquality.googleapis.com/v1/currentConditions:lookup?key={KEY}`
   - Timeout: 8 seconds.
   - If key missing, returns error, or 4xx/5xx/timeout -> proceed to fallback.
4. **Fallback Fetch (Open-Meteo Air Quality API)**:
   - Keyless open endpoint: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm2_5,us_aqi`
   - Timeout: 8 seconds.
5. **If Both Fail**:
   - Throw/return error with code `AQI_UNAVAILABLE`.
6. **Severe Smog Detection (AC-014-a)**:
   - If AQI ≥ 300 (or PM2.5 ≥ 250 µg/m³), set `isSevereHazard: true` and attach medical escalation advisory.
