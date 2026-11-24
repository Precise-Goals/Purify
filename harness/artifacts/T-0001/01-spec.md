---
status: pending
owner: po-spec
task: T-0001
inputs: ["harness/tasks/T-0001.md", "docs/harness.md"]
acceptance_refs: ["AC-004-a"]
---

# 01-spec: Curated Action Catalog (T-0001)

## Problem & Background
BreatheWise guarantees deterministic health impact numbers without LLM hallucination. To achieve this, the Gemini model is provided an enumerated list of catalog IDs. Any suggestions outside this list must be rejected, and the catalog provides the deterministic efficiency numbers for subsequent exposure calculations.

## Scope
- Authoritative action catalog schema and list in `src/lib/catalog.ts`.
- Validations for actions: drop unknown IDs, handle duplicates, return `MODEL_EMPTY` error when zero valid actions remain.
- Lookup utilities: `getActionById`, `listActions`, `validateActionIds`.

## Out of Scope
- Mathematical PM2.5 calculation formulas (handled in T-0002 `impact.ts`).
- Route handling or network fetching.

## Acceptance Criteria Mapping
- **AC-004-a**: Given Gemini returns unknown action IDs, When validated, Then those IDs are dropped; if none remain, error code `MODEL_EMPTY` is returned.
