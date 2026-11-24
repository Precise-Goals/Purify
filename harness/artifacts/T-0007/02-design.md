---
status: complete
owner: designer
task: T-0007
inputs: ["harness/artifacts/T-0007/01-spec.md"]
acceptance_refs: ["AC-011-a", "AC-011-b", "AC-014-a"]
---

# 02-design: Component Hierarchy & Layout (T-0007)

## Component Tree
```
AppLayout (src/app/layout.tsx)
└── HomePage (src/app/page.tsx)
    ├── Header & Brand Bar
    ├── ErrorBanner (shown on NO_KEY, QUOTA, AQI_UNAVAILABLE)
    ├── FormPanel
    │   ├── GeminiKeyInput (BYO key + remember toggle)
    │   ├── LocationSelector (City text input + GPS Geolocation button)
    │   ├── HouseholdFields (Home type, Cooking fuel, Commute, Budget, Hours, Purifier)
    │   └── FreeNotesInput (with 300 char counter)
    └── ResultsView (displayed upon successful POST /api/plan)
        ├── AqiBadge (src/components/AqiBadge.tsx)
        ├── SevereHazardBanner (AQI >= 300)
        ├── ImpactCard (src/components/ImpactCard.tsx)
        │   ├── ExposureComparison (Baseline vs Mitigated)
        │   ├── CigarettesSavedMetric
        │   └── MedicalCaveat
        ├── PlanDisplay (src/components/PlanDisplay.tsx)
        │   ├── RoutineTipsList
        │   └── CatalogActionCards
        └── TelemetryFooter (Pipeline execution trace in ms)
```
