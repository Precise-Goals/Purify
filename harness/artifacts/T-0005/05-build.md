---
status: complete
owner: builder
task: T-0005
inputs: ["harness/artifacts/T-0005/03-plan.md", "harness/artifacts/T-0005/04-tests.md"]
acceptance_refs: ["AC-003-a", "AC-003-b", "AC-007-b"]
---

# 05-build: Gemini Prompt Builder & Client Implementation (T-0005)

## Files Created / Modified
- `src/lib/gemini.ts`: Prompt generator with untrusted household tagging, markdown code fence stripper, JSON parser, and resilient Gemini fetch client with single 5xx retry and 429 quota handling without retry storms.
- `tests/gemini.test.ts`: 7 unit tests verifying prompt generation, fence stripping, candidate safety blocking, single 5xx retry, and 429 quota behavior.

## Checks Run
- `bun test tests/gemini.test.ts`: 7 passed [528ms]
- `bun run typecheck`: clean (0 errors)
- `python scripts/guard_paths.py --role builder`: clean (0 violations)
