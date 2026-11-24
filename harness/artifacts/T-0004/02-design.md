---
status: complete
owner: designer
task: T-0004
inputs: ["harness/artifacts/T-0004/01-spec.md"]
acceptance_refs: ["AC-001-a", "AC-001-b", "AC-001-c", "AC-007-c", "AC-014-a"]
---

# 02-design: Air Quality Interfaces & Contracts (T-0004)

```typescript
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  displayName: string;
}

export type AQISource = "google" | "open-meteo" | "cache";

export type AQICategory =
  | "Good"
  | "Moderate"
  | "UnhealthyForSensitiveGroups"
  | "Unhealthy"
  | "VeryUnhealthy"
  | "Hazardous";

export interface AirQualityData {
  aqi: number;
  pm25: number; // ug/m3
  category: AQICategory;
  source: AQISource;
  location: LocationCoordinates;
  isSevereHazard: boolean; // true if AQI >= 300
  medicalEscalation?: string;
  fetchedAt: string; // ISO 8601
}
```
