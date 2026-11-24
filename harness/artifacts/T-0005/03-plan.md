---
status: complete
owner: tech-lead
task: T-0005
inputs: ["harness/artifacts/T-0005/01-spec.md", "harness/artifacts/T-0005/02-design.md"]
acceptance_refs: ["AC-003-a", "AC-003-b", "AC-007-b"]
---

# 03-plan: Gemini Integration Plan (T-0005)

## Lane Assignment
- **Lane**: `lane-api`
- **File**: `src/lib/gemini.ts`

## Key Implementation Details
1. `buildGeminiPrompt(profile: SanitizedProfile, aqiData: AirQualityData): { systemInstruction: string; userPrompt: string }`
2. `parseGeminiResponse(rawText: string): GeminiPlanOutput`
   - Handles ` ```json ... ``` ` fences and raw JSON strings.
3. `callGemini(profile, aqiData, options): Promise<GeminiPlanOutput>`
   - Plain HTTP POST using injected `FetchLike`.
   - Single retry on status in `[500, 502, 503, 504]`.
   - Non-retrying throw on 429 (`QUOTA`).
   - Timeout abort with `AbortSignal.timeout(30000)`.
