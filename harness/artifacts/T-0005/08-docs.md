---
status: complete
owner: scribe
task: T-0005
inputs: ["harness/artifacts/T-0005/01-spec.md", "src/lib/gemini.ts"]
acceptance_refs: ["AC-003-a", "AC-003-b", "AC-007-b"]
---

# 08-docs: Gemini Client Documentation (T-0005)

## Public API Reference: `src/lib/gemini.ts`
- `callGemini(profile, aqiData, options)`: Sends prompt to Gemini AI with JSON response configuration, retrying 5xx once and halting on 429 quota limits.
- `buildGeminiPrompt(profile, aqiData)`: Formats system instructions and isolates untrusted household profile inside `<household>` tags.
- `parseGeminiResponse(rawText)`: Strips markdown fences and parses plan output.
- `GeminiError`: Typed error class with codes `NO_KEY`, `BAD_KEY`, `QUOTA`, `GEMINI_FAIL`, `MODEL_BLOCKED`, `MODEL_BAD_JSON`, `MODEL_EMPTY`.
