<!-- generated-by: harness v1 | source: harness.md -->
# Pipeline — BreatheWise

## Stage graph

```mermaid
flowchart LR
  T[Task Definition] --> PO[PO-Spec\n01-spec.md]
  PO --> D[Designer\n02-design.md]
  D --> TL[Tech Lead\n03-plan.md]
  TL --> TA[Test Author\nred tests + 04-tests.md]
  TA --> B1[Builder lane A\n05-build-a.md]
  TA --> B2[Builder lane B\n05-build-b.md]
  B1 & B2 --> G1[Gate 1\nformat + lint + typecheck\n+ lane unit tests + semgrep]
  G1 --> M[Merge + Gate 2\nfull unit suite + coverage]
  M --> R[Reviewer\n06-review.md]
  M --> S[Security\n06b-security.md]
  M --> SC[Scribe\n08-docs.md]
  R & S & SC --> G3[Gate 3\n0 BLOCKER/MAJOR\n0 high vulns\n0 secrets]
  G3 --> QA[QA / Evaluator\n07-qa.md]
  QA -->|PASS| L[Librarian\nlessons + AGENTS.md]
  L --> DONE[Orchestrator: Done\nstate.json updated]
  QA -->|FAIL| B1
```

## Parallelism rules
- **Parallel**: Builder lane A ‖ lane B (disjoint file ownership per `03-plan.md`).
- **Parallel after merge**: Reviewer ‖ Security ‖ Scribe.
- **Sequential (hard dependencies)**: PO-Spec → Designer → Tech Lead → Test Author → Builders → G1/G2 → {Review, Security, Docs} → G3 → QA.
- Max parallel agents: `harness/state/budgets.json.max_parallel_agents` (2).

## Handoff protocol
Every stage emits a handoff JSON: `harness/artifacts/<TASK-ID>/handoff-<from>-to-<to>.json`.
See `harness/standards/handoff-contract.md` for schema and rejection rules.

## Failure handling
- QA FAIL: return to the named stage with incremented `attempts` counter.
- Breaker trips if `max_stage_retries` exceeded: see `scripts/breaker.py`.
- Guard violation (file outside allow-list): **immediate** breaker trip.
