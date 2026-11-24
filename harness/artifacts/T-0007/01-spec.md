---
status: complete
owner: po-spec
task: T-0007
inputs: ["harness/tasks/T-0007.md", "docs/harness.md", "docs/raw.md §2,§13"]
acceptance_refs: ["AC-001-c", "AC-007-a", "AC-011-a", "AC-011-b", "AC-014-a"]
---

# 01-spec: UI Specification (T-0007)

## Design System & Tokens
- **Primary Orange**: `#FF6A13`
- **Cobalt**: `#0047AB`
- **Deep Cobalt**: `#00245E`
- **Surface**: High AA contrast cards with clear borders and legible typography.
- **Accessibility**: Visible keyboard focus rings (`focus-visible:ring-2`), responsive down to 360 px without horizontal scroll, prefers-reduced-motion respected.

## Functional Flow
1. **API Key Setup**:
   - Masked input with toggle visibility button.
   - "Remember on this device" checkbox storing to `localStorage`.
   - Security explanation: "Your key stays in your browser and is only sent directly to Google via our secure proxy header. Never logged or saved."
2. **Location Entry**:
   - Text input for city.
   - "Use GPS Location" button triggering `navigator.geolocation.getCurrentPosition`.
3. **Household Profile**:
   - Home type (Sealed / Standard / Leaky).
   - Cooking fuel (LPG/Electric / Biomass/Wood / Kerosene).
   - Daily outdoor hours slider (0 to 16h).
   - Air purifier toggle checkbox.
   - Notes text area (max 300 chars counter).
4. **Result Presentation**:
   - Live AQI badge (Green / Yellow / Orange / Red / Purple / Maroon).
   - Prominent Emergency Red Warning if AQI ≥ 300.
   - Deterministic PM2.5 Impact & Cigarette reduction metrics.
   - Actionable catalog cards with efficiency badges.
