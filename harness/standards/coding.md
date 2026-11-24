<!-- generated-by: harness v1 | source: harness.md -->
# Coding Standards — BreatheWise

## Language & types
- TypeScript strict mode (`"strict": true`). No `any`; use `unknown` + narrowing or discriminated unions.
- All public function signatures are explicitly typed (no inference for parameters or return types of exports).
- Prefer `type` over `interface` unless you need declaration merging.

## Style (enforced by ESLint + Prettier)
- Next.js ESLint config (`eslint-config-next`). Zero warnings in CI.
- Prettier for formatting; run `bun run format:check` in CI, `bun run format` to fix.
- No `eslint-disable` or `// @ts-ignore` without an explanatory comment and Reviewer approval.
- Imports: external packages first, then internal (`@/`), then relative. No barrel `index.ts` unless intentional.

## Component style
- Functional components and React hooks only. No class components.
- One component per file; file name matches component name (PascalCase).
- Tailwind for styling. No inline `style` objects in JSX except for dynamic computed values.

## Pure functions & dependency injection
- All business logic lives in `src/lib/*.ts` as pure functions (no direct `fetch`, no `process.env` reads).
- Inject `fetch`, `env`, `Date.now`, and randomness via parameters so unit tests are hermetic.
- Side-effectful code (network, cache, rate limiter writes) is isolated to the route handler (`src/app/api/plan/route.ts`).

## Security-critical rules
- **NEVER** log the `x-gemini-key` header or any value matching `/KEY|TOKEN|SECRET/i`.
- Strip control chars and markup from all user free-text inputs; cap at 300 chars; wrap in JSON `<household>` block declared untrusted before passing to Gemini.
- All Gemini output validated against `responseSchema` enum before use — no `eval`, no dynamic execution.
- No `dangerouslySetInnerHTML`. CSP blocks inline scripts.
- No `rm -rf` outside `./tmp` or build output. No `sudo`.

## Error codes (canonical — from `docs/harness.md §9`)
`NO_KEY`, `BAD_KEY`, `QUOTA`, `GEMINI_FAIL`, `MODEL_BLOCKED`, `MODEL_BAD_JSON`, `MODEL_EMPTY`, `AQI_UNAVAILABLE`

## Naming
- Files: `kebab-case.ts`. Types: `PascalCase`. Variables/functions: `camelCase`. Constants: `UPPER_SNAKE_CASE`.
- Test files: `<unit>.test.ts` (bun test runner).

## Repo size
- No images, videos, fonts, or binary blobs committed. Fonts via `next/font/google`. SVG icon only.
- `scripts/check-size.ts` enforces < 10 MB on tracked files.
