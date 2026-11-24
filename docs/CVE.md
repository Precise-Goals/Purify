# Security Hardening Prompt: CVE and Vulnerability Checklist for AI-Built Applications

> Paste this entire prompt into your AI coding assistant (Claude Code, Cursor, Copilot, etc.) at the root of your project.

---

## ROLE

You are a senior application security engineer. Audit this codebase for known CVEs, common vulnerabilities, and insecure patterns typical of AI-generated code, then fix them with the smallest possible change.

## ABSOLUTE CONSTRAINTS (NON-NEGOTIABLE)

1. **Do NOT change the UI or interface**: no layout, styling, copy, component structure, routes, or UX flow changes.
2. **Do NOT change the backend API contract**: keep endpoints, HTTP methods, request and response shapes, status codes, and auth flow compatible.
3. **Do NOT change the database schema**: no migrations, renamed columns, or altered types unless a vulnerability cannot be fixed any other way.
4. **Change only when necessary.** Prefer configuration, dependency upgrades, input validation, and middleware over rewrites. Do not refactor, reformat, or "improve" unrelated code.
5. If a fix **would** require breaking any of the above, **STOP and ask me first.** Explain the risk, the proposed change, and a non-breaking alternative if one exists.
6. Never commit secrets, never print real secrets in output, and never weaken an existing security control.

## WORKFLOW

### Phase 1: Discover (read-only)
- Detect languages, frameworks, package managers, runtime versions, Dockerfiles, CI/CD config, and IaC files.
- Map entry points: routes, controllers, webhooks, file upload handlers, background jobs, and third-party integrations.
- Report what you found before changing anything.

### Phase 2: Scan
Run the tools that apply to the detected stack (install only as dev or one-off tools, not as app dependencies):

| Area | Example tools |
|---|---|
| Dependency CVEs (Node) | `npm audit`, `pnpm audit`, `yarn npm audit`, `osv-scanner` |
| Dependency CVEs (Python) | `pip-audit`, `safety`, `osv-scanner` |
| Dependency CVEs (Java/Go/Rust/Ruby/PHP) | `OWASP dependency-check`, `govulncheck`, `cargo audit`, `bundler-audit`, `composer audit` |
| Static analysis (SAST) | `semgrep --config auto`, `bandit`, `eslint-plugin-security`, `gosec`, CodeQL |
| Secrets | `gitleaks detect`, `trufflehog` |
| Containers and IaC | `trivy fs .`, `trivy image`, `hadolint`, `checkov` |
| Licenses and SBOM | `syft`, `cyclonedx` |

If a tool is unavailable, perform the equivalent manual review and say so.

### Phase 3: Triage
For every finding, record: **ID or CVE, severity (CVSS), affected file or package, exploitability in this app's context, and fix.** Mark false positives with a reason. Prioritize: Critical, High, Medium, Low.

### Phase 4: Fix (minimal diffs)
- Dependency issues: upgrade to the **lowest patched version** that stays on the same major version when possible. Run tests after each bump. If a major upgrade is unavoidable, flag it and ask first.
- Code issues: add validation, encoding, parameterization, or middleware in place. Do not alter function signatures, response formats, or public routes.
- Config issues: harden headers, cookies, CORS, TLS, and permissions through configuration.

### Phase 5: Verify
- Run the existing test suite, linter, type-check, and build. Everything that passed before must still pass.
- Re-run the scanners and show before and after results.
- Confirm explicitly that UI, API contract, and schema are unchanged (show `git diff --stat` and list any exceptions with justification).

---

## VULNERABILITY CHECKLIST

Check every item. Mark each **Pass / Fixed / Not applicable / Needs approval**.

### 1. Dependencies and supply chain (OWASP A06, A08)
- [ ] No known CVEs in direct or transitive dependencies (Critical and High fixed; Medium and Low documented)
- [ ] Lockfile committed and used in CI (`npm ci`, `pip install --require-hashes`, etc.)
- [ ] No unpinned `latest` or wildcard versions in production dependencies
- [ ] No abandoned, typosquatted, or unnecessary packages
- [ ] No postinstall scripts from untrusted packages
- [ ] Dependabot or Renovate configured (config file only, no code change)
- [ ] CI actions pinned to a version or commit SHA

### 2. Injection (OWASP A03)
- [ ] SQL and NoSQL queries are parameterized or use an ORM safely (no string concatenation)
- [ ] No OS command injection (`exec`, `system`, `subprocess(shell=True)`, backticks)
- [ ] No template injection, LDAP, XPath, or header injection
- [ ] No `eval`, `Function()`, `pickle.loads`, `yaml.load` (unsafe), or unsafe deserialization on untrusted data
- [ ] Prototype pollution guarded (object merge and deep-set utilities)

### 3. Cross-site scripting and output handling
- [ ] No unsanitized `dangerouslySetInnerHTML`, `innerHTML`, `v-html`, or `|safe`
- [ ] User-generated HTML sanitized with a maintained library (DOMPurify or equivalent)
- [ ] Content-Security-Policy set without breaking existing UI (start in report-only mode if risky)
- [ ] Markdown and rich-text renderers sanitized

### 4. Authentication and session management (OWASP A07)
- [ ] Passwords hashed with bcrypt, scrypt, or argon2 (never MD5, SHA1, or plain text)
- [ ] JWTs: strong secret or key, algorithm pinned (reject `none`), expiry set, validated on every request
- [ ] Cookies: `HttpOnly`, `Secure`, `SameSite` set; session ID rotated on login
- [ ] Rate limiting and lockout on login, signup, password reset, and OTP endpoints
- [ ] Password reset tokens are single-use, short-lived, and unguessable
- [ ] No default or hardcoded credentials, backdoors, or debug accounts

### 5. Authorization and access control (OWASP A01)
- [ ] Every endpoint enforces auth server-side (not only hidden in the UI)
- [ ] No IDOR / BOLA: object access is checked against the current user or tenant
- [ ] Role and permission checks exist on admin and privileged routes
- [ ] No mass assignment (allow-list bindable fields)
- [ ] Row-level security or equivalent is enabled where the database supports it (verify only, do not alter the schema)

### 6. Cryptography and data protection (OWASP A02)
- [ ] TLS enforced; HSTS enabled
- [ ] No weak algorithms (MD5, SHA1, DES, ECB) for security purposes
- [ ] Secure randomness (`crypto.randomBytes`, `secrets`) for tokens and IDs
- [ ] Sensitive data not logged, not in URLs, not in client-side storage
- [ ] PII and secrets encrypted at rest where already supported by the stack

### 7. Secrets and configuration (OWASP A05)
- [ ] No API keys, tokens, or credentials in source, Git history, front-end bundles, or Docker layers
- [ ] `.env` files ignored by Git; `.env.example` contains placeholders only
- [ ] If a secret was exposed: **list it for rotation** (never reuse it) and remove it from code
- [ ] Debug mode, verbose errors, stack traces, and source maps disabled in production
- [ ] Default admin consoles, Swagger/GraphQL introspection, and test routes restricted in production

### 8. HTTP, CORS, and transport hardening
- [ ] Security headers: `X-Content-Type-Options`, `X-Frame-Options` or `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`
- [ ] CORS allow-list is explicit (no `*` with credentials, no reflected origin)
- [ ] CSRF protection on cookie-authenticated state-changing requests
- [ ] Request size limits and timeouts set
- [ ] Open redirects validated against an allow-list

### 9. Server-side request forgery and file handling
- [ ] Outbound requests from user-supplied URLs are allow-listed and block internal IP ranges and cloud metadata endpoints (169.254.169.254)
- [ ] File uploads: type, size, and extension validated; stored outside the web root; randomized filenames; no execution
- [ ] Path traversal prevented (`../`) on file read, write, and download
- [ ] Archive extraction protected from zip-slip and zip bombs
- [ ] XML parsers have external entities (XXE) disabled

### 10. API and business-logic security
- [ ] Input validation on all request bodies, params, queries, and headers (schema validation)
- [ ] Rate limiting and pagination limits on expensive endpoints
- [ ] GraphQL: depth and complexity limits, introspection off in production
- [ ] Webhooks verify signatures
- [ ] Race conditions and double-spend risks on payment, credit, and inventory flows
- [ ] Error responses do not leak internals

### 11. AI and LLM-specific risks (OWASP LLM Top 10)
- [ ] No API keys for AI providers exposed to the client; calls proxied server-side
- [ ] Prompt injection: untrusted content (user input, documents, web pages) is isolated from system instructions
- [ ] LLM output treated as untrusted: never passed to `eval`, shell, SQL, or rendered as raw HTML
- [ ] Tool and agent permissions follow least privilege; destructive actions require confirmation
- [ ] Per-user rate limits and spend caps to prevent abuse and cost exhaustion
- [ ] No sensitive data or other users' data placed in prompts without need
- [ ] Logs do not store secrets or personal data from prompts and responses

### 12. Infrastructure, containers, and CI/CD
- [ ] Docker: non-root user, minimal or pinned base image, no secrets in layers, `.dockerignore` present
- [ ] No privileged containers or unnecessary exposed ports
- [ ] CI secrets stored in the secret manager, not in workflow files; least-privilege tokens
- [ ] Cloud storage buckets and databases not publicly accessible
- [ ] Backups and logging enabled (verify only)

### 13. Logging and monitoring (OWASP A09)
- [ ] Auth failures, access-control failures, and admin actions are logged
- [ ] Log injection prevented (sanitize newlines and control characters)
- [ ] No sensitive values in logs

---

## OUTPUT FORMAT

Deliver the report in this structure:

1. **Summary**: stack detected, tools run, total findings by severity
2. **Findings table**:

   | # | Severity | CVE / CWE | Location | Description | Fix applied | Breaking? |
   |---|---|---|---|---|---|---|

3. **Changes made**: file-by-file minimal diffs with a one-line reason each
4. **Needs my approval**: any fix that would touch UI, API contract, or schema, with risk, proposed change, and alternatives
5. **Manual actions for me**: secret rotation, cloud console settings, and anything not fixable in code
6. **Verification**: test, build, and scan results before vs. after; confirmation that UI, API, and schema are unchanged
7. **Residual risk**: accepted or deferred items with justification

## DEFINITION OF DONE

- Zero Critical or High findings remain unless explicitly approved as an exception
- All previously passing tests, builds, and type-checks still pass
- No UI, API contract, or schema changes (or each was approved by me)
- Report delivered in the format above

Begin with Phase 1 and report your findings before making any changes.
