---
status: complete
owner: scribe
task: T-0007
inputs: ["harness/artifacts/T-0007/01-spec.md", "src/app/page.tsx"]
acceptance_refs: ["AC-011-a", "AC-011-b", "AC-014-a"]
---

# 08-docs: UI Documentation (T-0007)

## User Interface Overview
- `HomePage` (`src/app/page.tsx`): Form-first Next.js page allowing user to input their Gemini API key, location (manual city or GPS), housing and lifestyle parameters, and view a personalized smog routine.
- `AqiBadge`: Renders live ambient air quality, PM2.5 concentration, and high-visibility red hazard warning when AQI ≥ 300.
- `ImpactCard`: Displays deterministic arithmetic metrics: percentage exposure reduction, daily & annual cigarette equivalents avoided, and monthly CO2 savings.
- `PlanDisplay`: Lists AI protocol tips and catalog-validated actions with cost and efficiency badges.
