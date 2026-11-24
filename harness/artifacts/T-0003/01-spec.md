---
status: complete
owner: po-spec
task: T-0003
inputs: ["harness/tasks/T-0003.md", "docs/harness.md", "docs/raw.md §7,§9"]
acceptance_refs: ["AC-007-a", "AC-009-a", "AC-009-b"]
---

# 01-spec: Input Sanitisation & Rate Limiter (T-0003)

## Security Rules
1. **API Key Checks (AC-007-a)**:
   - Missing or empty -> `NO_KEY`.
   - Length < 20 or non-matching Gemini AI key pattern (`AIzaSy...` or alphanumeric length check) -> `BAD_KEY`.
2. **Body Size Check (AC-009-b)**:
   - Body bytes > 8,192 (8 KB) -> reject with `BODY_TOO_LARGE`.
3. **Free Text Sanitization**:
   - Strip ASCII control characters (`\x00-\x08\x0B\x0C\x0E-\x1F\x7F`).
   - Strip HTML/XML tags (`<[^>]*>`).
   - Slice at 300 Unicode code points.
4. **Rate Limiting (AC-009-a)**:
   - Sliding window of 60 seconds.
   - Max 8 requests per IP window.
   - 9th request rejected with retry-after.
   - Bounded memory map (≤ 5,000 entries).
