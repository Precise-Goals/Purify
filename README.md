# BreatheWise 🌬️
> **A form-first, zero-chat Gemini AI winter smog-season assistant with deterministic PM2.5 exposure and health impact arithmetic.**

[![CI](https://github.com/Precise-Goals/Purify/actions/workflows/ci.yml/badge.svg)](https://github.com/Precise-Goals/Purify/actions/workflows/ci.yml)
[![Repository Size](https://img.shields.io/badge/repo%20size-0.61%20MB-emerald.svg)](scripts/check-size.ts)
[![Single Branch](https://img.shields.io/badge/branch-main%20only-blue.svg)](https://github.com/Precise-Goals/Purify/branches)
[![Bun](https://img.shields.io/badge/Bun-1.4.4-black.svg)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Repository Link**: [https://github.com/Precise-Goals/Purify](https://github.com/Precise-Goals/Purify)  
**Main Branch**: `main` (Strictly 1 branch maintained)  
**Tracked Repository Size**: **0.61 MB** (Well below the 10.0 MB submission cap, enforced by CI)

---

## 1. Chosen Vertical
**Smart Living / Clean Air & Health Intelligence**  
*Focus*: Personalized winter smog protection and airborne particulate (PM2.5) exposure reduction for households across the Indo-Gangetic Plain and East Asia (Delhi-NCR, Lahore, Dhaka, Beijing, and regional cities).

### Problem Statement & Need
During severe winter smog seasons, hazardous air quality (AQI 200–500+) poses immediate risks to vulnerable individuals (infants, asthmatics, and seniors). Existing applications only provide raw air quality numbers without actionable, personalized protocols. Blanket generic advice such as "stay indoors" fails low-to-medium income families who cannot afford commercial purifiers or who must commute daily. Furthermore, generic LLM solutions often hallucinate medical and physical claims.

---

## 2. Approach & Logic

BreatheWise bridges personal context and air quality intelligence through a **form-first, chat-free architecture**:
1. **Context-Aware Dynamic Reasoning**: Instead of open-ended conversational rambling, the user supplies precise household parameters: location, home permeability (sealed vs. leaky), cooking fuel (LPG vs. biomass), commute style (metro/carpool vs. two-wheeler), budget preference, outdoor exposure hours, and existing air purifier status.
2. **Catalog-Bound Physical Safety**: The LLM is strictly constrained to an authoritative, empirically verified catalog of smog interventions (`src/lib/catalog.ts`). The AI model explains the routine and selects relevant intervention IDs; **deterministic TypeScript code executes all physical arithmetic**. This guarantees zero hallucinated health claims or fictional numbers.
3. **Compound Exposure Modeling**: The impact engine calculates exposure reduction dynamically using physical time-weighted equations (combining outdoor exposure and indoor infiltration). Same-scope interventions stack multiplicatively without double-counting, capped at a realistic 90% benefit limit.
4. **Hyperlocal Dual-Tier Air Quality**: Automatically fetches live ambient AQI and PM2.5 from **Google Air Quality API**, with seamless fallback to keyless **Open-Meteo Air Quality API** and 10-minute in-memory caching.
5. **BYO-Key Privacy Architecture**: The user brings their own Google Gemini API key. Keys are never logged, never stored server-side, and never persisted without explicit local browser opt-in.

---

## 3. How the Solution Works

```
User (Browser Client)
  │
  │  1. Enters Location (GPS auto-locate or City), Profile, & BYO Gemini API Key
  │  2. Submits POST /api/plan (JSON payload + x-gemini-key header)
  ▼
API Route Guard (`/api/plan`)
  │
  ├── IP Rate Limiter (8 requests / min sliding window)
  ├── Key Format Validator (NO_KEY / BAD_KEY checks before network)
  ├── Body Size Guard (Enforces strict 8 KB payload cap)
  └── Text Sanitizer (Strips control chars & HTML tags; caps notes at 300 chars)
  ▼
Live 5-Stage Execution Pipeline (`src/lib/pipeline.ts`)
  │
  ├── [Stage 1] Air Quality Engine (`src/lib/aqi.ts`)
  │     Geocode ➔ Google Air Quality API ➔ Open-Meteo Fallback (10m cache)
  │     Categorizes AQI: flags Severe Hazard Emergency if AQI ≥ 300
  │
  ├── [Stage 2] Prompt Isolation (`src/lib/gemini.ts`)
  │     Wraps untrusted household notes inside `<household untrusted="true">`
  │     Injects authoritative list of allowed catalog action IDs
  │
  ├── [Stage 3] Gemini AI Inference (`gemini-1.5-flash`)
  │     Generates structured JSON plan; retries 5xx once; halts 429 quota storms
  │
  ├── [Stage 4] Catalog Validation (`src/lib/catalog.ts`)
  │     Drops any unrecognized action IDs; enforces MODEL_EMPTY fallback
  │
  └── [Stage 5] Deterministic Impact Arithmetic (`src/lib/impact.ts`)
        Computes baseline vs. mitigated PM2.5 exposure (µg/m³)
        Calculates Berkeley Earth cigarette-equivalents avoided (22 µg/m³ = 1 cig/day)
        Computes monthly CO2 reduction from transit/fuel swaps
  ▼
User Interface Response
  • Live AQI Badge with ambient PM2.5 and source attribution
  • Emergency Red Medical Warning Banner if AQI ≥ 300
  • Deterministic Impact Cards (Exposure Reduction %, Cigarettes Avoided)
  • Personalized Daily Action Protocol & Catalog Intervention Cards
  • Microsecond Execution Trace Telemetry
```

---

## 4. Key Assumptions Made

| ID | Assumption | Implementation Detail |
|---|---|---|
| **ASM-001** | **BYO Gemini API Key** | The user supplies their own free-tier or paid Gemini key. Operators incur zero model execution costs. |
| **ASM-002** | **Air Quality Dual-Tier Fallback** | Google Air Quality API server key is optional. If missing or rate-limited, the system automatically falls back to keyless Open-Meteo. |
| **ASM-003** | **Indoor Infiltration Factor** | In standard construction, indoor PM2.5 is assumed to be 60% of ambient outdoor PM2.5 (36% if an air purifier is running; 40% for sealed; 65% for leaky homes). |
| **ASM-004** | **Berkeley Earth Cigarette Metric** | An average 24-hour inhalation of 22 µg/m³ PM2.5 is approximately equivalent to smoking 1 cigarette (Berkeley Earth empirical model). |
| **ASM-005** | **Multiplicative Stacking Cap** | Real-world filtration interventions stack multiplicatively (`1 - Product(1 - eff)`) and are capped at 90% maximum exposure reduction to account for realistic seal leakage. |
| **ASM-006** | **Single Branch & Size Constraint** | Development is maintained exclusively on the `main` branch with zero large media/binaries to keep repository size below 10 MB. |

---

## 5. Evaluation Focus Areas Alignment

### 🌟 High Impact
- **Code Quality**:
  - Strict TypeScript (`"strict": true`, zero `any`, typed interfaces throughout).
  - Pure modular business logic with dependency injection (`FetchLike`) enabling 100% hermetic testing without live network requirements.
  - Next.js 15 App Router architecture with standalone output optimization.
- **Problem Statement Alignment**:
  - Tailored to winter smog realities in South/East Asia.
  - Supports low-budget interventions (DIY box-fan filters, wet-mopping, window weatherstripping) alongside high-tier solutions.
  - Automatic emergency escalation banner for dangerous air conditions (AQI ≥ 300).

### ⚙️ Medium Impact
- **Security & Responsibility**:
  - API keys are never logged, never persisted server-side, and never stored in URLs.
  - Strict input sanitization strips HTML/XML and control characters to prevent prompt injection and stored XSS.
  - Rate limiting (8 requests/min/IP) and 8 KB payload caps prevent denial-of-service and memory exhaustion.
  - Security headers enforced: Content Security Policy (CSP), HSTS, X-Content-Type-Options (`nosniff`), X-Frame-Options (`DENY`), Referrer-Policy, and Permissions-Policy.
- **Efficiency & Performance**:
  - Built on high-performance Bun runtime (tests execute in ~550ms).
  - Zero heavy third-party SDKs; plain `fetch` ensures lightweight bundle size (first-load JS ~103 KB).
  - 10-minute bounded cache reduces third-party API traffic and eliminates quota waste.
  - Standalone multi-stage Docker build runs as non-root `bun` user.
- **Testing & Verification**:
  - **50 unit & integration tests** (`bun test`) with 100% pass rate.
  - **41 harness self-tests** (`pytest tests/harness/`) validating project contracts, breaker budgets, path guards, and state machines.
  - Tests-first discipline: failing red-runs captured prior to code construction.

### 🎨 Low Impact (Polish & Accessibility)
- **Accessibility (a11y)**:
  - Responsive design down to 360 px viewports with zero horizontal scrolling.
  - Accessible contrast ratios (AA standard) using deep cobalt `#00245E`, white surfaces, and bold text.
  - Dedicated `@media (prefers-reduced-motion: reduce)` rules disable transitions for sensitive users.
  - Keyboard navigable with prominent focus rings (`focus-visible:ring-2`).

---

## 6. Project Structure

```
├── .github/
│   └── workflows/ci.yml         # GitHub Actions CI verifying G0-G4 gates on push
├── docs/
│   ├── raw.md                   # Problem statement & technical specification
│   ├── harness.md               # Master start document & architecture rules
│   └── prompt.md                # Harness operating manual
├── harness/
│   ├── agents/                  # Skinny agent pointers (≤ 40 lines each)
│   ├── roles/                   # 11 Fat role specifications (all 12 mandatory sections)
│   ├── standards/               # Coding, testing, git, handoff, and DoD standards
│   ├── tasks/                   # Tasks T-0001 through T-0007 definitions
│   └── artifacts/               # Full artifact trails (01-spec through 08-docs per task)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root HTML layout and metadata
│   │   ├── page.tsx             # Responsive form-first assistant interface
│   │   ├── globals.css          # Design tokens and reduced-motion rules
│   │   └── api/
│   │       ├── plan/route.ts    # POST /api/plan with rate limit, key check & pipeline
│   │       └── health/route.ts  # GET /api/health for container probes
│   ├── components/
│   │   ├── AqiBadge.tsx         # Live AQI & severe hazard emergency banner
│   │   ├── ImpactCard.tsx       # Exposure %, cigarette equivalents, and caveat
│   │   └── PlanDisplay.tsx      # Curated catalog interventions and routine tips
│   └── lib/
│       ├── aqi.ts               # Google AQ API + Open-Meteo fallback + 10m cache
│       ├── catalog.ts           # Curated intervention catalog & ID validation
│       ├── gemini.ts            # Gemini prompt builder, fence stripper & retry client
│       ├── impact.ts            # Deterministic PM2.5 exposure math & cigarette model
│       ├── pipeline.ts          # 5-stage pipeline runner with telemetry trace
│       ├── rate-limiter.ts      # In-memory sliding window rate limiter
│       └── sanitize.ts          # Free text sanitization and key validation
├── tests/
│   ├── aqi.test.ts              # Unit tests for air quality & fallback
│   ├── catalog.test.ts          # Unit tests for catalog inventory & ID validation
│   ├── gemini.test.ts           # Unit tests for prompt building & resilience
│   ├── impact.test.ts           # Unit tests for exposure arithmetic & edge cases
│   ├── pipeline.test.ts         # Integration tests for end-to-end pipeline & routes
│   ├── sanitize.test.ts         # Unit tests for key checks, payload size & limiter
│   ├── ui.test.ts               # Unit tests for component styling
│   └── harness/                 # 41 Python harness integrity tests
├── scripts/
│   ├── check-size.ts            # Tracked size gate (< 10 MB limit check)
│   ├── check_harness.py         # Harness linter
│   ├── guard_paths.py           # Path & lane write guard
│   └── breaker.py               # Circuit breaker with budget tracking
├── Dockerfile                   # Hardened multi-stage non-root bun container
├── docker-compose.yml           # Compose specification with health check
└── package.json                 # Next.js 15, React 19, TypeScript, Bun test runner
```

---

## 7. Quickstart & Verification Commands

### Prerequisites
- [Bun](https://bun.sh) (v1.2+) or Node.js (v20+)
- Python 3.10+ (for harness validation)
- Free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Run Locally
```bash
# Clone repository
git clone https://github.com/Precise-Goals/Purify.git
cd Purify

# Install dependencies
bun install

# Start development server
bun dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Verify Everything
```bash
# Full project verification (Typecheck + 50 tests + size check)
bun run verify

# Harness integrity self-test
python scripts/check_harness.py && pytest tests/harness/

# Production Next.js build
bun run build

# Docker production container build
docker compose up --build
```

---

## 8. License
MIT License. Built with the **Harness Engineering** methodology.
