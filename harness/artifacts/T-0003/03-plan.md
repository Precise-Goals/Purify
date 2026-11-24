---
status: complete
owner: tech-lead
task: T-0003
inputs: ["harness/artifacts/T-0003/01-spec.md", "harness/artifacts/T-0003/02-design.md"]
acceptance_refs: ["AC-007-a", "AC-009-a", "AC-009-b"]
---

# 03-plan: Sanitizer & Rate Limiter Implementation Plan (T-0003)

## Lane Assignment
- **Lane**: `lane-api`
- **Files**: `src/lib/sanitize.ts`, `src/lib/rate-limiter.ts`

## Module Responsibilities
1. `src/lib/sanitize.ts`:
   - `validateGeminiKey(key: unknown): { valid: boolean; code?: "NO_KEY" | "BAD_KEY" }`
   - `checkPayloadSize(rawBodyString: string): { valid: boolean; bytes: number }`
   - `sanitizeFreeText(text: unknown, maxLen?: number): string`
   - `sanitizeProfile(raw: unknown): { profile?: SanitizedProfile; error?: string }`
2. `src/lib/rate-limiter.ts`:
   - `RateLimiter` class / singleton with `check(ip: string, nowMs?: number): RateLimitResult`
   - Tests with injected timestamp clock for hermetic determinism.
