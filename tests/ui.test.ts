import { describe, expect, it } from "bun:test";
import { getAqiColorClass } from "../src/components/AqiBadge";

describe("ui: AqiBadge color styling", () => {
  it("maps Good category to green styling", () => {
    const cls = getAqiColorClass("Good");
    expect(cls).toContain("emerald");
  });

  it("maps Hazardous and severe AQI to red/rose styling", () => {
    const cls = getAqiColorClass("Hazardous");
    expect(cls).toContain("rose");
  });

  it("maps Unhealthy to orange/amber styling", () => {
    const cls = getAqiColorClass("Unhealthy");
    expect(cls).toContain("orange");
  });
});
