# Glossary — BreatheWise

| Term | Definition |
|---|---|
| AQI | Air Quality Index (0–500+); values ≥ 300 trigger escalation banner in BreatheWise |
| PM2.5 | Particulate matter ≤ 2.5 µm diameter; primary health harm metric |
| Catalog | `src/lib/catalog.ts` — the authoritative list of action IDs, efficiencies, costs, and scopes |
| Impact model | Deterministic arithmetic (not AI) computing PM2.5 reduction % from selected catalog actions |
| BYO key | Bring-Your-Own Gemini API key; operator pays nothing for model calls |
| Lane | A parallel Builder worktree owning a disjoint set of files |
| Harness | Scaffold of agents, roles, standards, scripts, and gates (docs/prompt.md) |
| G0–G5 | Quality gates (docs/prompt.md §9.1) |
| WIF | Workload Identity Federation — keyless GitHub Actions → GCP auth |
| RWA | Resident Welfare Association — community-level user group |
| Open-Meteo | Keyless open-source weather/AQ API used as fallback when Google AQ API unavailable |
| Cigarette-equivalent | 22 µg/m³ (24h average PM2.5) ≈ 1 cigarette (Berkeley Earth rule of thumb; labelled approximate) |
