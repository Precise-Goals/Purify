<!-- generated-by: harness v1 | source: harness.md -->
# Sandbox Rules — BreatheWise

Applies to all agents with `bash` tool access (Builder, Test Author, QA, Security, Orchestrator).

## Allowed working directories
- Repo root (`D:\Workspace\Projects\pwvirtual\` or equivalent) and its subdirectories.
- System temp dir (`%TEMP%` / `/tmp`) for scratch files only — cleaned up after use.
- **Never**: `~`, `/etc`, other repos, system directories outside the above.

## Allowed commands
Only commands listed in `docs/harness.md §8` plus read-only inspection:
- `ls`, `dir`, `cat`, `type`, `grep`, `rg`, `jq`, `git status`, `git diff`, `git log`
- `python scripts/check_harness.py`, `python scripts/guard_paths.py`, `python scripts/breaker.py`
- `python -m pytest tests/harness`

## Network rules
- Only allow-listed hosts in `harness/tools/registry.yaml`.
- No `curl | sh`, `wget | bash`, or any pipe-to-shell from the network.
- No `npm publish`, `bun publish`, or package registry writes.

## Destructive operation rules
- No `rm -rf` outside `./tmp` or build output dirs (`./dist`, `./.next`, `./out`).
- No `sudo`. No privilege escalation.
- No `git push --force` or `git reset --hard origin/<branch>`.

## Secret hygiene
- Redact any value matching `/KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL/i` before logging.
- Never echo environment variables that may contain secrets.
- Every command + exit code is logged to `harness/logs/events.jsonl` (redacted).

## Timeouts & budgets
- Per-command timeout: 120 s (kill and log if exceeded).
- Per-session wall-clock budget: `harness/state/budgets.json.max_session_minutes` (90 min default).
- Per-stage tool call budget: `max_tool_calls_per_stage` (150 default).
