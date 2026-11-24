---
status: complete
owner: builder
task: T-0003
inputs: ["harness/artifacts/T-0003/03-plan.md", "harness/artifacts/T-0003/04-tests.md"]
acceptance_refs: ["AC-007-a", "AC-009-a", "AC-009-b"]
---

# 05-build: Input Sanitisation & Rate Limiter Implementation (T-0003)

## Files Created / Modified
- `src/lib/sanitize.ts`: Gemini key format validator (`NO_KEY`, `BAD_KEY`), 8 KB payload size checker, HTML/XML tag stripper, control char scrubber, 300-char string truncation, and profile normalizer.
- `src/lib/rate-limiter.ts`: Sliding-window memory rate limiter (8 req/60s) with TTL eviction and 5,000 max entry pruning.
- `tests/sanitize.test.ts`: 12 unit tests verifying key checks, size boundaries, rate limiter resets, and HTML injection prevention.

## Checks Run
- `bun test tests/sanitize.test.ts`: 12 passed [26ms]
- `bun run typecheck`: clean (0 errors)
- `python scripts/guard_paths.py --role builder`: clean (0 violations)
