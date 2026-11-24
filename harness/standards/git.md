<!-- generated-by: harness v1 | source: harness.md -->
# Git Standards — BreatheWise

## Commit convention (Conventional Commits)
```
<type>(<scope>): <short description>

[optional body — what and why, not how]
[optional footer — breaking change, closes #issue]
```
Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `ci`, `build`
Scopes: `catalog`, `impact`, `aqi`, `gemini`, `pipeline`, `sanitize`, `ui`, `infra`, `harness`

Examples:
- `feat(catalog): add N95 outdoor action with efficiency 0.60`
- `fix(impact): cap total reduction at 90% when stacking actions`
- `chore(harness): scaffold sprint 0`
- `test(impact): add zero-PM2.5 edge case`

## Branch naming
- Feature branches: `feat/<TASK-ID>-<short-slug>` (e.g. `feat/T-0001-catalog`)
- Parallel builder lanes: `lane/<TASK-ID>-<lane-name>` (e.g. `lane/T-0006-api`)
- Harness work: `chore/harness-<description>`

## Forbidden git operations (enforced in registry.yaml)
- `git push --force` (use `--force-with-lease` only with Orchestrator approval)
- `git reset --hard origin/<branch>` (destructive; needs user approval)
- Any `git commit --amend` to published commits

## Commit hygiene
- Each commit is atomic: one logical change, all tests passing at that point.
- No secrets in commit messages, diff, or file content (`check_harness.py` checks).
- Repo size < 10 MB: run `bun run check-size` before committing large file additions.
- Lockfile (`bun.lock`) committed after `bun install`; never manually edited.

## PR / merge rules (when CI is configured)
- All CI gates (G0 typecheck, test, size, build, harness self-test) must be green before merge.
- No self-merge; at minimum the Reviewer role must have approved via `06-review.md`.
- Squash merge preferred for feature work; merge commit for sprints (preserves lane history).
