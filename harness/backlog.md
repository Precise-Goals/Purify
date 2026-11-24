<!-- generated-by: harness v1 | source: harness.md -->
# Backlog — BreatheWise

> MoSCoW order. Tasks are elaborated into `harness/tasks/<ID>.md` at sprint planning — not before.

## MUST (Sprint 1 — Walking Skeleton)
- T-0001 Curated action catalog (`src/lib/catalog.ts`) — data layer, no network
- T-0002 Deterministic PM2.5 impact model (`src/lib/impact.ts`) — pure functions
- T-0003 Input sanitisation & rate limiting (`src/lib/sanitize.ts`, `src/lib/rate-limiter.ts`)
- T-0004 AQI fetch with Google AQ → Open-Meteo fallback + 10-min cache (`src/lib/aqi.ts`)
- T-0005 Gemini prompt builder + response validator (`src/lib/gemini.ts`)
- T-0006 Full pipeline + route handler (`src/lib/pipeline.ts`, `src/app/api/plan/route.ts`, `src/app/api/health/route.ts`)
- T-0007 UI: form entry + plan result display (`src/app/`, `src/components/`)

## MUST (Sprint 2 — Hardening)
- T-0008 Security headers, CSP, HSTS, container hardening
- T-0009 Firebase Anonymous Auth + optional Firestore plan save/retrieve
- T-0010 GitHub Actions CI/CD pipeline (typecheck → test → size → build → docker → deploy on main)
- T-0011 Accessibility: 360px responsive, keyboard nav, AA contrast, reduced-motion

## SHOULD (Sprint 2)
- T-0012 Multilingual strings: English, Hindi (hi), Marathi (mr)

## COULD (Sprint 3 / Roadmap)
- T-0013 24-48h AQI forecast to schedule outdoor windows
- T-0014 Community / RWA aggregate impact mode
- T-0015 PWA offline tips
- T-0016 Firebase App Check + Cloud Armor for production rate limiting
- T-0017 Calibrate impact model with local sensor data / clinical review

## Sprint 0 (Harness — running now)
- Scaffold: profile.yaml, state, all agents/roles/standards/workflows, registry, AGENTS.md, scripts, harness tests
