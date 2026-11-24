---
status: complete
owner: scribe
task: T-0003
inputs: ["harness/artifacts/T-0003/01-spec.md", "src/lib/sanitize.ts", "src/lib/rate-limiter.ts"]
acceptance_refs: ["AC-007-a", "AC-009-a", "AC-009-b"]
---

# 08-docs: Sanitizer & Rate Limiter Documentation (T-0003)

## Public API Reference
- `validateGeminiKey(key: unknown): ValidateKeyResult`: Checks presence and alphanumeric length rules.
- `checkPayloadSize(rawBodyString: string): PayloadSizeResult`: Caps body at 8,192 bytes.
- `sanitizeFreeText(input: unknown, maxLength?: number): string`: Strips tags and control characters.
- `sanitizeProfile(raw: unknown): SanitizeProfileResult`: Validates profile fields and enforces defaults.
- `RateLimiter`: Sliding-window limiter with `check(ip, nowMs)` method.
