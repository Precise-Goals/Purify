<!-- generated-by: harness v1 | source: harness.md@pending | hash: pending -->
# AGENTS.md — BreatheWise
> Map, not manual. Deep detail lives in linked files. ≤ 150 lines enforced.

## What this is
BreatheWise: a form-first Gemini AI smog assistant. User supplies location + household + their own Gemini key → personalised action plan with deterministic PM2.5 impact.
Full plan: [docs/harness.md](docs/harness.md) · Problem: [docs/raw.md](docs/raw.md)

## Start here (every session)
1. Read this file → 2. `harness/state/state.json` → 3. `docs/prompt.md §1` Boot Sequence

## Commands
| Purpose | Command |
|---|---|
| Install | `bun install` |
| Lint | `bun run lint` |
| Type-check | `bun run typecheck` |
| Unit tests | `bun test` |
| Full verify | `bun run verify` |
| Harness self-test | `python scripts/check_harness.py && python -m pytest tests/harness` |

## Layout
```
src/lib/          # catalog, impact, aqi, gemini, pipeline, sanitize, rate-limiter
src/app/api/      # plan/route.ts, health/route.ts
src/components/   # UI components
tests/            # core.test.ts (bun), harness/ (pytest)
harness/          # agents, roles, standards, workflows, state, artifacts, tasks, logs
docs/             # raw.md, harness.md, prompt.md, mcp.md, memory/, adr/
scripts/          # check_harness.py, guard_paths.py, breaker.py, check-size.ts
```

## Roles
| Agent | Role file | Artifact |
|---|---|---|
| Orchestrator | [harness/roles/orchestrator.md](harness/roles/orchestrator.md) | state.json, logs |
| PO-Spec | [harness/roles/po-spec.md](harness/roles/po-spec.md) | 01-spec.md |
| Designer | [harness/roles/designer.md](harness/roles/designer.md) | 02-design.md |
| Tech Lead | [harness/roles/tech-lead.md](harness/roles/tech-lead.md) | 03-plan.md |
| Test Author | [harness/roles/test-author.md](harness/roles/test-author.md) | tests/, 04-tests.md |
| Builder | [harness/roles/builder.md](harness/roles/builder.md) | source files, 05-build.md |
| Reviewer | [harness/roles/reviewer.md](harness/roles/reviewer.md) | 06-review.md |
| Security | [harness/roles/security.md](harness/roles/security.md) | 06b-security.md |
| QA | [harness/roles/qa.md](harness/roles/qa.md) | 07-qa.md |
| Scribe | [harness/roles/scribe.md](harness/roles/scribe.md) | 08-docs.md |
| Librarian | [harness/roles/librarian.md](harness/roles/librarian.md) | docs/memory/, AGENTS.md |

## Rules (top 10)
1. **Never log the Gemini key.** Redact `*KEY*`, `*TOKEN*`, `*SECRET*` in all outputs. → [harness/standards/coding.md](harness/standards/coding.md)
2. **Tests-first.** Test Author writes failing tests before Builder writes code. → [docs/prompt.md](docs/prompt.md#8)
3. **Catalog-bound impact.** LLM picks action IDs; code does arithmetic. No hallucinated numbers. → [harness/standards/coding.md](harness/standards/coding.md)
4. **No deploy by agents.** Deploy is `forbidden` in registry.yaml. → [harness/tools/registry.yaml](harness/tools/registry.yaml)
5. **80% coverage floor** on changed lines. → [harness/standards/testing.md](harness/standards/testing.md)
6. **Guard clean.** `guard_paths.py` must exit 0 after every agent finishes. → [scripts/guard_paths.py](scripts/guard_paths.py)
7. **State on disk.** All state in `harness/state/state.json`. Never in context window. → [docs/prompt.md](docs/prompt.md#6.5)
8. **Repo < 10 MB.** No images, videos, or fonts committed. → [harness/standards/git.md](harness/standards/git.md)
9. **Sanitise free text.** Strip control chars, cap at 300 chars, wrap as JSON `<household>` declared untrusted. → [harness/standards/coding.md](harness/standards/coding.md)
10. **Fail loud, fail early.** Trip the circuit breaker rather than thrash. → [scripts/breaker.py](scripts/breaker.py)

## Gates & breakers
G0 (harness integrity) → G1 (lane) → G2 (merge) → G3 (review) → G4 (QA) → G5 (sprint)
See [docs/prompt.md §9](docs/prompt.md) · Budgets: [harness/state/budgets.json](harness/state/budgets.json)

## Memory map
| Need | Look here |
|---|---|
| Past decisions | [harness/logs/decisions.log.md](harness/logs/decisions.log.md) |
| Lessons learned | [docs/memory/lessons.md](docs/memory/lessons.md) |
| Past task artifacts | `harness/artifacts/<TASK-ID>/` |
| Architecture decisions | `docs/adr/ADR-NNNN-*.md` |

## Do-not list
- Do NOT write outside your role's allow-list (guard_paths.py enforces this).
- Do NOT run `deploy`, `firebase deploy`, `gcloud run deploy`, or any push to production.
- Do NOT edit `docs/raw.md` or `docs/harness.md` content (read-only for all agents).
- Do NOT commit `bun.lock` without running `bun install` first on a networked machine.
- Do NOT add `eslint-disable`, `// @ts-ignore`, or skip/xfail tests without Reviewer approval.
- Do NOT make network calls to hosts not in `harness/tools/registry.yaml` allowed_hosts.
