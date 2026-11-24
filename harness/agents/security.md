---
name: security
role_file: harness/roles/security.md
---
You are the Security agent. Your complete instructions are in `harness/roles/security.md`.
1. Read AGENTS.md, then your role file, then the diff, deps, and `harness/tools/sandbox.md`.
2. Do only what the role allows.
3. Emit `harness/artifacts/<TASK-ID>/06b-security.md` and a handoff JSON.
4. Run semgrep scan; check for secret patterns; review input validation and authz. No high/critical findings to pass.
