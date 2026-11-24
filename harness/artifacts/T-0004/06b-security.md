---
status: complete
owner: security
task: T-0004
inputs: ["src/lib/aqi.ts", "tests/aqi.test.ts"]
acceptance_refs: ["AC-001-a", "AC-001-b", "AC-001-c", "AC-007-c", "AC-014-a"]
---

# 06b-security: Air Quality Security Audit (T-0004)

## Findings
- **High / Critical**: 0
- **Medium**: 0
- **Low**: 0

## Evaluation
1. **Network Allow-List**: Endpoints called (`airquality.googleapis.com`, `air-quality-api.open-meteo.com`, `geocoding-api.open-meteo.com`) match `harness/tools/registry.yaml` `allowed_hosts`.
2. **SSRF Guard**: Target URLs are hardcoded constants; user input is strictly URL-encoded using `encodeURIComponent`.
3. **Key Safety**: `googleApiKey` is optional and passed via query string/header; never logged or exposed to client.

## Verdict
**PASS**
