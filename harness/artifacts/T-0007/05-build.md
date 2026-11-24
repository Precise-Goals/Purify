---
status: complete
owner: builder
task: T-0007
inputs: ["harness/artifacts/T-0007/03-plan.md", "harness/artifacts/T-0007/04-tests.md"]
acceptance_refs: ["AC-011-a", "AC-011-b", "AC-014-a"]
---

# 05-build: User Interface Implementation (T-0007)

## Files Created / Modified
- `src/app/globals.css`: Brand design system, color tokens (Orange `#FF6A13`, Cobalt `#0047AB`), and `prefers-reduced-motion` overrides.
- `src/app/layout.tsx`: Root HTML layout with viewport and meta tags.
- `src/components/AqiBadge.tsx`: Color-coded category badge, PM2.5 display, source attribution, and emergency hazard banner (AQI ≥ 300).
- `src/components/ImpactCard.tsx`: Exposure reduction %, cigarette equivalents avoided, CO2 saved, and transparent medical disclaimer.
- `src/components/PlanDisplay.tsx`: Actionable daily protocol and catalog-bound intervention cards with cost tiers and efficiency badges.
- `src/app/page.tsx`: Responsive client page with BYO Gemini key input (localStorage remember toggle), city/GPS auto-locate, household parameters, notes with 300-char counter, loading skeleton, and pipeline telemetry trace.
- `tests/ui.test.ts`: 3 unit tests for AQI badge category styling.

## Checks Run
- `bun test tests/ui.test.ts`: 3 passed [9ms]
- `bun test`: 50 passed across 7 test suites [593ms]
- `bun run typecheck`: clean (0 errors)
- `python scripts/guard_paths.py --role builder`: clean (0 violations)
