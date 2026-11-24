\# RAW.md: BreatheWise (Gemini AI smog-season assistant)



Single source of truth: idea, feasibility, architecture, constraints, edge cases, delivery.



\## 1. Problem

Severe winter smog (Delhi-NCR, Indo-Gangetic Plain, Lahore, Dhaka, Beijing) hits children, seniors and people with asthma hardest. Families get raw AQI numbers but not \*\*what to do today\*\*, \*\*why it helps\*\*, or \*\*what is affordable\*\*. Generic advice ("stay indoors") ignores home type, cooking fuel, commute, budget and language.



\## 2. Idea

Chat-free, form-first assistant. The user supplies location + household + lifestyle and \*\*their own Gemini AI API key\*\*. The app:

1\. Fetches live air quality for the location.

2\. Asks Gemini AI for a tailored routine, indoor air hacks and sustainable swaps.

3\. Maps every suggestion to a \*\*curated action catalog\*\* and computes the \*\*direct impact\*\* (PM2.5 exposure change, cigarette-equivalents, CO2 saved) deterministically.



Design principle: \*\*the LLM chooses and explains; code does the arithmetic.\*\* This prevents hallucinated health numbers.



\### Users and needs

| User | Need |

|---|---|

| Parents | Safe school-run, play, and sleep plan |

| Seniors / asthma households | Conservative guidance, clear escalation to a doctor |

| Low-budget families | Cheap options first (DIY box-fan filter, wet-mopping) |

| Communities / RWAs | Collective swaps (carpool, no waste burning) with visible impact |



\## 3. Feasibility

\- \*\*Technical\*\*: all components are public APIs; no training, no GPUs. Free tiers cover a pilot (Gemini API free tier, Open-Meteo, Firebase Spark, Cloud Run free quota).

\- \*\*Cost\*\*: the user's own Gemini key means \*\*zero model cost to the operator\*\*. Hosting is near-zero at pilot scale.

\- \*\*Data\*\*: Google Air Quality API (best) with Open-Meteo fallback (keyless).

\- \*\*Risk\*\*: health misinformation (mitigated by catalog-bound numbers + disclaimers); key handling (see section 7).

\- \*\*Repo constraint\*\*: tracked files must stay under 10 MB. Source is \~80 KB; no images/videos/fonts committed (fonts via `next/font/google`, SVG icon only). Enforced by `scripts/check-size.ts` in CI.



\## 4. Google technology map

| Tech | Use |

|---|---|

| \*\*Gemini AI API\*\* (`generateContent`, JSON schema output, system instruction) | Personalized plan generation, multilingual (en/hi/mr) |

| \*\*Google Air Quality API\*\* | Primary live AQI and PM2.5 (optional server key) |

| \*\*Firebase Auth (anonymous)\*\* | Frictionless per-device identity |

| \*\*Cloud Firestore\*\* + security rules | Optional plan-history summaries |

| \*\*Firebase Analytics\*\* | Best-effort usage events (`plan\_generated`) |

| \*\*Firebase Hosting\*\* | Global CDN front door, rewrites to Cloud Run |

| \*\*Cloud Run\*\* | Runs the Docker image (scale-to-zero) |

| \*\*Cloud Build + Artifact Registry\*\* | Pipeline: verify, build, push, deploy |

| \*\*Workload Identity Federation\*\* | Keyless GitHub Actions to GCP auth |

| \*\*Google Fonts (`next/font`)\*\* | Self-hosted at build, no runtime third-party call |



\## 5. Architecture and live pipeline

```

Browser (Next.js client)

&#x20; | POST /api/plan  (profile JSON + x-gemini-key header)

&#x20; v

Route handler: rate limit -> key format check -> size cap -> parse/sanitize

&#x20; v

runPipeline (each stage timed, returned as "trace" to the UI)

&#x20; 1 Air quality : geocode (Open-Meteo) -> Google AQ API -> fallback Open-Meteo, 10 min bounded cache

&#x20; 2 Build prompt: system rules + untrusted <household> data + allowed action ids

&#x20; 3 Gemini AI   : structured JSON (responseSchema, enum of action ids), 30s timeout, 1 retry on 5xx

&#x20; 4 Validate    : parse, strip fences, coerce, drop unknown ids, cap lengths

&#x20; 5 Impact model: exposure = (out\*PM + in\*PM\*infiltration)/24; multiplicative stacking; 90% cap

&#x20; v

Response {air, plan, impact, trace}  ->  optional Firestore save (client, anonymous auth)

```

Stack: \*\*Bun\*\* (runtime, package manager, test runner), \*\*Next.js 15 App Router\*\*, React 19, TypeScript strict, standalone output.



\## 6. Impact model (transparent assumptions)

\- Indoor PM2.5 = 60% of outdoor in a leaky home; 36% if a purifier exists.

\- Action efficiencies live in `src/lib/catalog.ts` (e.g. N95 outdoors 60% after fit loss, HEPA 50%, box-fan filter 40%).

\- Same-scope actions multiply (no double counting); each action counted once; total benefit capped at 90%.

\- Cigarette-equivalent: 22 ug/m3 (24h) \~ 1 cigarette (Berkeley Earth rule of thumb). Labelled approximate.

\- Every result carries a caveat string. Not a medical device.



\## 7. Security

\- \*\*BYO key\*\*: user key goes browser -> our route -> Google in the `x-goog-api-key` header; never in URL, never logged, never written to Firestore. Optional "remember" uses `localStorage` (documented trade-off: XSS could read it; mitigated by strict CSP, no third-party scripts besides Google, no `dangerouslySetInnerHTML`). Unchecked = memory only.

\- \*\*Prompt injection\*\*: free text is stripped of control chars/markup, capped at 300 chars, passed as JSON inside `<household>` and declared untrusted; output is schema-constrained and catalog-validated, so injected text cannot add actions or numbers.

\- \*\*Headers\*\*: CSP, HSTS, nosniff, frame-ancestors none, Referrer-Policy, Permissions-Policy.

\- \*\*Abuse\*\*: 8 req/min/IP sliding window, 8 KB body cap, bounded caches.

\- \*\*Firestore rules\*\*: owner-only, create-only, field allow-list, size cap, default deny.

\- \*\*Container\*\*: non-root `bun` user, slim image, read-only FS in compose, `no-new-privileges`.

\- \*\*Supply chain\*\*: lockfile committed after first `bun install`; CI uses Workload Identity (no long-lived JSON keys).



\## 8. Performance and resources

\- Server: stateless, \~512 MiB Cloud Run, concurrency 40. Caches bounded (200 AQI entries, 5000 limiter keys).

\- Upstream budget: AQI <= 8s, Gemini <= 30s (+1 retry), client abort at 50s.

\- Output capped at 4096 tokens; list lengths capped; no SDK for Gemini (plain `fetch`, smaller bundle).

\- Firebase SDK is client-only and lazy for Analytics.



\## 9. Edge cases and handling

| Case | Behaviour |

|---|---|

| No / malformed key | 401 `NO\_KEY` before any network call |

| Key revoked / wrong | 401 `BAD\_KEY` with fix hint |

| Gemini quota (429) | `QUOTA` message, no retry storm |

| Gemini 5xx / timeout | one retry w/ backoff, then 502/504 |

| Safety-blocked / empty output | `MODEL\_BLOCKED`, asks to rephrase notes |

| Invalid JSON / fenced JSON | fences stripped; else `MODEL\_BAD\_JSON` |

| Model invents action ids | dropped; if nothing valid left -> `MODEL\_EMPTY` |

| Duplicate actions | counted once in impact |

| Geolocation denied/unsupported/timeout | inline message, city text fallback |

| City not found / ambiguous | 404 with advice; first geocoder match used |

| Lat/lon out of range, NaN | 422 |

| Google AQ key missing/failing | automatic Open-Meteo fallback |

| Both AQ sources fail | `AQI\_UNAVAILABLE` 502 |

| AQI Good/Moderate | prompt tells model to keep plan light, no alarmism |

| AQI >= 300 | UI banner + medical-care escalation |

| 0 outdoor hours / 16 hours | clamped 0-16, math safe |

| Zero PM2.5 | reduction 0%, no divide-by-zero |

| Oversized / non-JSON body | 413 / 400 |

| Rate limited | 429 (note: per-instance; use Cloud Armor/Firestore counter at scale) |

| localStorage blocked | try/catch, key stays in memory |

| Firebase not configured | save option hidden, app fully works |

| Firestore save fails | non-blocking warning |

| Offline | fetch error surfaced; no stale plan shown |

| Non-English notes | allowed (Unicode kept) |

| Reduced motion / transparency | animations off; glass becomes solid cobalt |

| Stale cached AQI | 10 min TTL, `fetchedAt` returned |

| Duplicate-name cities | place label includes admin region/country so users can verify |



\## 10. Testing and maintainability

\- `bun test` (tests/core.test.ts): AQI maths, sanitiser, model-output hardening, impact model, rate limiter, full pipeline with \*\*injected dependencies\*\* (no network).

\- Small pure modules (`aqi`, `impact`, `sanitize`, `catalog`, `gemini`, `pipeline`), single responsibility, typed end to end.

\- CI gates: typecheck -> tests -> repo size (<10 MB) -> build -> docker build + container smoke test -> deploy (main only).



\## 11. Delivery pipeline

\- \*\*GitHub Actions\*\* `ci-cd`: verify, docker, deploy (WIF auth -> Cloud Build -> Cloud Run -> Firebase Hosting + rules).

\- \*\*Cloud Build\*\* `cloudbuild.yaml`: verify, build, push to Artifact Registry, deploy.

\- \*\*Docker\*\*: multi-stage, standalone Next output, healthcheck at `/api/health`.



\## 12. Setup

```bash

bun install

cp .env.example .env          # all optional

bun dev                       # paste your Gemini key in the UI

bun run verify                # typecheck, tests, size, build

docker compose up --build

```

Firebase: create project, enable Anonymous Auth + Firestore, put web config in `.env`, set project id in `.firebaserc`, `firebase deploy --only firestore`.

GitHub secrets: `GCP\_WIF\_PROVIDER`, `GCP\_SERVICE\_ACCOUNT`, `GCP\_PROJECT`.



\## 13. Design system

Orange `#FF6A13`, Cobalt `#0047AB`, deep cobalt `#00245E`, white. Maximalist: oversized Bricolage Grotesque headlines with hard orange offset shadows, drifting liquid blobs distorted by an SVG turbulence filter, frosted glass panels with an SVG-noise grain overlay, white content cards for legibility (AA contrast). Keyboard focus rings visible; responsive to 360 px.



\## 14. Rubric mapping

| Criterion | Where addressed |

|---|---|

| Code quality (high) | small typed modules, injected deps, no dead code |

| Problem fit (high) | location + household + lifestyle plan with quantified impact |

| Safety (medium) | section 7 |

| Efficiency (medium) | section 8 |

| Testability (low) | section 10 |



\## 15. Known limits and roadmap

\- Impact model is a rule-of-thumb estimate; calibrate with local sensor data and clinical review.

\- Rate limiting is per instance. Add Firebase App Check, Cloud Armor.

\- Add 24-48h forecast (Open-Meteo/Google AQ forecast) to schedule outdoor windows.

\- Community mode: Firestore-aggregated neighbourhood impact; more languages; PWA offline tips.

\- Lockfile `bun.lock` is generated on first install (no network in the authoring environment); commit it.

\- Code was authored without network access: run `bun install \&\& bun run verify` once before first deploy.

