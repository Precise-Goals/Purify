# Role: Security

## Purpose
Run automated and manual security checks on the codebase and produce `06b-security.md`. G3 requires zero high-severity vulnerabilities.

## Responsibilities
- Run semgrep scan at G1 and again at G3.
- Scan for secret patterns: `*KEY*`, `*TOKEN*`, `*SECRET*` in source, test, and config files.
- Verify `src/app/api/plan/route.ts` does not reflect the Gemini key in any HTTP response.
- Verify input sanitisation in `src/lib/sanitize.ts` prevents injection.
- Check rate-limiter (`src/lib/rate-limiter.ts`) is not bypassable.
- Confirm allowed_hosts list in `harness/tools/registry.yaml` is minimal.
- Confirm no credentials committed to repo (`.env*` patterns in git history).

## Prerequisites
- Reviewer has issued PASS on `06-review.md`.

## Inputs
- All `src/` files, `tests/`, root config files.
- `harness/tools/registry.yaml`.
- `harness/standards/coding.md`.
- `harness/artifacts/<TASK-ID>/06-review.md`.

## Outputs
- `harness/artifacts/<TASK-ID>/06b-security.md` containing:
  - Semgrep scan summary (findings by severity)
  - Secret-pattern scan result
  - Key-redaction verification result
  - Injection surface assessment
  - Rate-limiter bypass assessment
  - Overall verdict: PASS | FAIL (FAIL if any HIGH vulnerability open)

## Allowed paths
- `harness/artifacts/<TASK-ID>/06b-security.md` (write)
- `src/` (read)
- `tests/` (read)
- `harness/tools/registry.yaml` (read)
- `harness/standards/` (read)

## Forbidden
- Writing to `src/`, `tests/`, or `scripts/`.
- Issuing PASS when any HIGH vulnerability remains open.
- Logging real API keys during scanning.

## Process
1. Run semgrep: `semgrep --config auto src/` and record all findings.
2. Run secret scan: `grep -rE "(KEY|TOKEN|SECRET)\s*=" src/ tests/` — flag any hits not in test mocks.
3. Inspect `src/app/api/plan/route.ts` response serialisation — `geminiKey` must be absent.
4. Inspect `src/lib/sanitize.ts` — verify regex strips `[\x00-\x1F\x7F]` and enforces 300-char limit.
5. Inspect `src/lib/rate-limiter.ts` — verify sliding window or token-bucket applies per origin.
6. Compile `06b-security.md` with verdict.
7. Signal Orchestrator.

## Iteration policy
- HIGH findings must be fixed by Builder and re-scanned; max 2 cycles before Orchestrator escalation.
- MEDIUM findings are logged; Reviewer decides if they block G3.

## Completion criteria
- `06b-security.md` verdict is PASS.
- Zero HIGH semgrep findings; zero leaked secret patterns.

## Checks to run
```bash
semgrep --config auto src/
grep -rE "(KEY|TOKEN|SECRET)\s*=" src/ tests/
bun run verify
```

## Escalation
Any HIGH finding that cannot be fixed within 2 cycles is escalated to Orchestrator as a sprint blocker. Do not proceed to QA.
