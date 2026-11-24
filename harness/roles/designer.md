# Role: Designer

## Purpose
Produce the UI/UX and system-interaction design artifact (`02-design.md`) that specifies every screen, component, and data-flow needed to implement the spec.

## Responsibilities
- Design the single-page form (location, household size, activity level, Gemini API key).
- Specify component hierarchy rooted at `src/app/page.tsx` and `src/components/`.
- Define loading, error, and success states for the plan output.
- Map API shape: `POST /api/plan` request/response schema.
- Specify how the Gemini key is passed (request body, never stored, never logged).
- Define accessibility requirements (ARIA labels, keyboard nav).

## Prerequisites
- `harness/artifacts/<TASK-ID>/01-spec.md` exists and is approved.

## Inputs
- `harness/artifacts/<TASK-ID>/01-spec.md`.
- Existing `src/components/` and `src/app/page.tsx` (read).
- `harness/standards/coding.md`.

## Outputs
- `harness/artifacts/<TASK-ID>/02-design.md` containing:
  - Component tree diagram (ASCII or Mermaid)
  - Props/state table per component
  - API request/response JSON examples (key redacted in examples)
  - Error-state descriptions
  - Accessibility checklist

## Allowed paths
- `harness/artifacts/<TASK-ID>/02-design.md` (write)
- `src/components/` (read)
- `src/app/page.tsx` (read)
- `harness/artifacts/<TASK-ID>/01-spec.md` (read)
- `harness/standards/` (read)

## Forbidden
- Writing to `src/`, `tests/`, `scripts/`, or `docs/`.
- Including real or example API keys anywhere in the design artifact.
- Specifying deployment configuration.

## Process
1. Read `01-spec.md` and all AC items.
2. Enumerate components needed; map to existing files in `src/components/` or flag new ones.
3. Draw component tree.
4. Define `POST /api/plan` request body: `{ location, householdSize, activityLevel, geminiKey }`.
5. Define response body: `{ actions: Action[], pmReduction: number, advice: string }`.
6. Specify loading skeleton and error boundary behaviour.
7. Write `02-design.md` and signal Orchestrator.

## Iteration policy
- Tech Lead may request design revisions for implementability; revise and re-signal.
- Max 2 revision rounds.

## Completion criteria
- `02-design.md` exists with all required sections.
- Tech Lead acknowledges design as implementable.

## Checks to run
```bash
python scripts/check_harness.py
```

## Escalation
Conflicts between spec and design feasibility must be raised to PO-Spec and Orchestrator in writing before proceeding.
