# BreatheWise 🌬️
> Form-first, chat-free Gemini AI winter smog-season assistant with deterministic PM2.5 exposure and health impact arithmetic.

[![CI](https://github.com/Precise-Goals/Purify/actions/workflows/ci.yml/badge.svg)](https://github.com/Precise-Goals/Purify/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.4.4-black.svg)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)

---

## 🎯 The Problem
Severe winter smog in the Indo-Gangetic Plain and East Asia (Delhi-NCR, Lahore, Dhaka, Beijing) causes acute health harm to children, seniors, and people with asthma. Families get raw AQI alerts but no affordable, actionable guidance tailored to their specific housing permeability, cooking fuel, and daily commute. Generic advice ("stay indoors") fails low-income families and those who must travel daily.

## 💡 The Solution
BreatheWise is a form-first, zero-chat assistant. The user enters their location, housing type, daily commute, budget, and their own Google Gemini API key:
1. **Live Air Quality Engine**: Resolves location and fetches live ambient AQI and PM2.5 from **Google Air Quality API** (with automatic keyless **Open-Meteo** fallback and 10-minute caching).
2. **AI Action Selection**: **Gemini AI API** (`gemini-1.5-flash`) analyzes the household context and selects interventions strictly constrained to a curated catalog.
3. **Deterministic Impact Arithmetic**: Code computes exposure reduction, Berkeley Earth cigarette equivalents avoided (22 µg/m³ = 1 cigarette/day), and monthly CO2 saved. **The LLM explains and suggests; code does the arithmetic** to guarantee zero hallucinated health claims.

---

## 🏗️ Architecture & Google Technology Map

```
Browser (Next.js 15 Client)
    │  POST /api/plan  (profile JSON + x-gemini-key header)
    ▼
Route Handler: Rate Limit (8 req/min) ➔ Key Format Check ➔ Size Cap (8 KB) ➔ Sanitize
    ▼
5-Stage Live Pipeline:
  [1] Air Quality : Geocode ➔ Google Air Quality API ➔ Open-Meteo Fallback (10m cache)
  [2] Build Prompt: System Rules + Untrusted <household> Data + Catalog Action IDs
  [3] Gemini AI   : Structured JSON Generation (30s timeout, 1 retry on 5xx, quota abort)
  [4] Validation  : Filter against Curated Catalog (drop invented IDs; MODEL_EMPTY check)
  [5] Impact Math : Exposure Reduction % (capped at 90%) + Cigarette Equivalents
    ▼
Response: { air, plan, impact, trace }
```

| Technology | Purpose |
|---|---|
| **Gemini AI API** | Formulates personalized routines and selects catalog actions using JSON schema outputs |
| **Google Air Quality API** | Primary provider for live hyperlocal AQI and PM2.5 concentrations |
| **Cloud Run** | Scale-to-zero serverless container execution for standalone Next.js image |
| **Cloud Build & Artifact Registry** | CI/CD container build, verification, and deployment pipeline |
| **Firebase Hosting & Firestore** | CDN caching and optional user plan persistence |
| **Bun** | High-performance JavaScript runtime, package manager, and test runner |

---

## 🔒 Security & Privacy Model

- **BYO Key Architecture**: Users provide their own Gemini API key. Keys pass from client to server proxy via `x-gemini-key` header and directly to Google. Keys are **never logged**, never stored server-side, and never persisted without explicit local opt-in.
- **Prompt Injection Defense**: All user free-text is stripped of HTML/script tags and control characters, truncated to 300 characters, and passed to Gemini inside an explicit `<household untrusted="true">` boundary.
- **Strict Network Allow-List**: Outbound connections strictly limited to Google APIs, Open-Meteo, and package registries.
- **Rate Limiting & DoS Protection**: In-memory sliding window limiter (8 requests/min/IP) and 8,192 byte payload caps.

---

## ⚡ Quickstart

### Prerequisites
- [Bun](https://bun.sh) (v1.2+) or Node.js (v20+)
- Python 3.10+ (for harness verification tests)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Local Development
```bash
# 1. Clone repository
git clone https://github.com/Precise-Goals/Purify.git
cd Purify

# 2. Install dependencies
bun install

# 3. Start local development server
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser, enter your Gemini API key, and generate your first plan.

---

## 🧪 Verification & Testing Commands

| Purpose | Command |
|---|---|
| **Type-check** | `bun run typecheck` |
| **Unit tests** | `bun test` |
| **Tracked size check** | `bun run check-size` (< 10 MB limit) |
| **Full verify** | `bun run verify` |
| **Harness self-test** | `python scripts/check_harness.py && pytest tests/harness` |
| **Production build** | `bun run build` |
| **Docker container** | `docker compose up --build` |

---

## 📜 License
MIT License. Built with the **Harness Engineering** methodology.
