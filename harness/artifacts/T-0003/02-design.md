---
status: complete
owner: designer
task: T-0003
inputs: ["harness/artifacts/T-0003/01-spec.md"]
acceptance_refs: ["AC-007-a", "AC-009-a", "AC-009-b"]
---

# 02-design: Sanitizer & Rate Limiter Interfaces (T-0003)

```typescript
export interface HouseholdProfileInput {
  city?: string;
  latitude?: number;
  longitude?: number;
  homeType?: "sealed" | "standard" | "leaky";
  cookingFuel?: "lpg_electric" | "biomass_wood" | "kerosene";
  commuteMode?: "walk_cycle" | "two_wheeler" | "carpool_transit" | "personal_car";
  budget?: "low" | "medium" | "high";
  outdoorHours?: number;
  hasExistingPurifier?: boolean;
  notes?: string;
}

export interface SanitizedProfile {
  city: string;
  latitude?: number;
  longitude?: number;
  homeType: "sealed" | "standard" | "leaky";
  cookingFuel: "lpg_electric" | "biomass_wood" | "kerosene";
  commuteMode: "walk_cycle" | "two_wheeler" | "carpool_transit" | "personal_car";
  budget: "low" | "medium" | "high";
  outdoorHours: number;
  hasExistingPurifier: boolean;
  notes: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}
```
