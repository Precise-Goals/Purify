---
status: complete
owner: po-spec
task: T-0005
inputs: ["harness/tasks/T-0005.md", "docs/harness.md", "docs/raw.md §5,§7,§9"]
acceptance_refs: ["AC-003-a", "AC-003-b", "AC-007-b"]
---

# 01-spec: Gemini AI Client & Prompt Specification (T-0005)

## Prompt Construction
- **System Instruction**: Formulates personalized, empathetic smog actions for families in severe winter smog. Constrains advice to proven interventions and practical home hacks.
- **Untrusted Context**: User notes and profile injected as JSON inside `<household untrusted="true">` to prevent prompt injection.
- **Allowed Action IDs**: Injected list of all IDs from `ACTION_CATALOG`.
- **Response Schema**: Instructs model to output JSON adhering to:
  ```json
  {
    "summary": "string",
    "actionIds": ["string"],
    "dailyRoutineTips": ["string"],
    "language": "en | hi | mr"
  }
  ```

## Resilience & Error Codes
- **429**: Immediate abort with `QUOTA` error. Zero retries.
- **500/502/503/504**: One retry with backoff. If second attempt fails -> `GEMINI_FAIL`.
- **Safety Block / Empty**: Return `MODEL_BLOCKED`.
- **Malformed JSON**: Attempt fence removal; if still invalid -> `MODEL_BAD_JSON`.
