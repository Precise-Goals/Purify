<!-- generated-by: harness v1 | source: harness.md -->
# Parallel Lanes — BreatheWise

## Lane rules
- Each Builder lane uses its own git worktree/branch: `lane/<TASK-ID>-<lane-name>`.
- Tech Lead's `03-plan.md` is the **authoritative ownership map** — no two lanes may own the same path.
- Locks are written to `harness/state/locks/<lane-name>.json` before work starts.
- `scripts/guard_paths.py` enforces path ownership; violations trip the circuit breaker immediately.

## Default lanes for BreatheWise (derived from module ownership, §7 of harness.md)
| Lane | Owned modules / files |
|---|---|
| `lane-data` | `src/lib/catalog.ts`, `src/lib/impact.ts`, `src/lib/aqi.ts` |
| `lane-api` | `src/lib/gemini.ts`, `src/lib/pipeline.ts`, `src/lib/sanitize.ts`, `src/lib/rate-limiter.ts`, `src/app/api/` |
| `lane-ui` | `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/` |
| `lane-infra` | `Dockerfile`, `docker-compose.yml`, `cloudbuild.yaml`, `firebase.json`, `firestore.rules`, `.github/workflows/` |

> Tech Lead sets the actual lanes per task in `03-plan.md`. Use at most 2 concurrent lanes (budget).

## Lock file schema (`harness/state/locks/<lane>.json`)
```json
{
  "lane": "lane-api",
  "task_id": "T-0006",
  "branch": "lane/T-0006-api",
  "agent": "builder",
  "owns": ["src/lib/gemini.ts", "src/lib/pipeline.ts", "src/app/api/plan/route.ts"],
  "started_at": "<iso8601>",
  "status": "in_progress | done | failed"
}
```

## Merge protocol
1. Each lane runs G1 (lint, typecheck, lane unit tests, semgrep).
2. Orchestrator merges lanes in dependency order into the sprint branch.
3. G2 (full unit suite + coverage) runs on the merged branch.
4. Lock files cleared after successful G2.
