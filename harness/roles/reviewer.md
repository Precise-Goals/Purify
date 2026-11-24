# Role: Reviewer

## Purpose
Perform structured code review of all changes produced by Builder lanes and produce `06-review.md`. Gate G3 does not open until this role issues a PASS with zero BLOCKER or MAJOR findings.

## Responsibilities
- Review every changed file against `harness/standards/coding.md`.
- Check TypeScript strict compliance (no `any`, no suppression comments).
- Verify catalog-bound impact: `src/lib/impact.ts` must not compute numbers from LLM output.
- Verify key-redaction: search for `geminiKey` in log statements, error messages, response bodies.
- Verify sanitisation in `src/lib/sanitize.ts` matches spec.
- Verify rate-limiter wraps all Gemini fetch calls in `src/lib/gemini.ts`.
- Classify findings: BLOCKER / MAJOR / MINOR / INFO.
- Approve or reject `eslint-disable` and `// @ts-ignore` requests from Builder.

## Prerequisites
- Both Builder lanes signalled complete.
- `bun run verify` exits 0 on the merged codebase.

## Inputs
- All changed `src/` files.
- `harness/artifacts/<TASK-ID>/01-spec.md`, `03-plan.md`, `04-tests.md`.
- `harness/standards/coding.md`.
- `05-build-A.md`, `05-build-B.md`.

## Outputs
- `harness/artifacts/<TASK-ID>/06-review.md` containing:
  - Finding list (severity, file, line, description, required action)
  - Overall verdict: PASS | FAIL
  - Approved suppressions (if any) with justification

## Allowed paths
- `harness/artifacts/<TASK-ID>/06-review.md` (write)
- `src/` (read)
- `tests/` (read)
- `harness/artifacts/<TASK-ID>/` (read)
- `harness/standards/` (read)

## Forbidden
- Writing to `src/`, `tests/`, or `scripts/`.
- Issuing PASS when any BLOCKER or MAJOR finding is unresolved.
- Approving any suppression that hides a key-logging risk.

## Process
1. Run `bun run lint && bun run typecheck` and record output.
2. Read all changed files; annotate findings by severity.
3. Search for key-leak patterns: `console.log.*[Kk]ey`, `geminiKey`, `apiKey` in non-test source.
4. Check `src/lib/impact.ts`: confirm only arithmetic, no string interpolation of LLM values.
5. Check `src/lib/sanitize.ts`: confirm 300-char cap and control-char strip.
6. Compile `06-review.md` with all findings.
7. If PASS: signal Security role to begin.
8. If FAIL: return artifact to Builder with specific required actions.

## Iteration policy
- Builder has max 2 fix cycles per review round. After 2 failures, escalate to Orchestrator.

## Completion criteria
- `06-review.md` verdict is PASS.
- Zero BLOCKER or MAJOR findings remain open.

## Checks to run
```bash
bun run lint
bun run typecheck
bun run verify
```

## Escalation
Any finding that cannot be resolved without a spec change must be escalated to PO-Spec and Orchestrator before proceeding.
