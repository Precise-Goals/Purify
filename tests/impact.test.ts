import { describe, expect, it } from "bun:test";
import { getActionById } from "../src/lib/catalog";
import {
  calculateImpact,
  calculateStackingReduction,
  type ImpactProfile,
} from "../src/lib/impact";

describe("impact: calculateStackingReduction (AC-005-c)", () => {
  it("multiplies same-scope action efficiencies without double counting", () => {
    // 0.5 (HEPA) and 0.4 (DIY fan) -> 1 - (1-0.5)*(1-0.4) = 1 - 0.3 = 0.70
    const eff = calculateStackingReduction([0.5, 0.4]);
    expect(eff).toBeCloseTo(0.7, 4);
  });

  it("caps maximum benefit at 90% (0.90) (AC-005-c)", () => {
    // 0.6 + 0.6 + 0.6 -> mathematically 1 - 0.4^3 = 0.936, but should cap at 0.90
    const eff = calculateStackingReduction([0.6, 0.6, 0.6]);
    expect(eff).toBe(0.9);
  });

  it("returns 0 for empty action list", () => {
    expect(calculateStackingReduction([])).toBe(0);
  });
});

describe("impact: calculateImpact calculations", () => {
  it("computes N95 outdoor reduction proportionally to outdoor hours (AC-005-a)", () => {
    const n95 = getActionById("n95_mask_commute")!;
    expect(n95).toBeDefined();

    // 4 hours outdoor, 20 hours indoor, outdoor PM2.5 = 200 ug/m3
    // Infiltration = 0.6 (leaky)
    // Baseline exposure = (4 * 200 + 20 * 200 * 0.6) / 24 = (800 + 2400) / 24 = 3200 / 24 = 133.3333
    // With N95: outdoor reduction is 0.60
    // Mitigated exposure = (4 * 200 * (1 - 0.60) + 20 * 200 * 0.6) / 24 = (320 + 2400) / 24 = 2720 / 24 = 113.3333
    // Expected reduction % = (133.3333 - 113.3333) / 133.3333 = 20.00%
    const profile: ImpactProfile = {
      outdoorHours: 4,
      outdoorPM25: 200,
      hasExistingPurifier: false,
    };

    const res = calculateImpact(profile, [n95]);

    expect(res.baselineExposurePM25).toBeCloseTo(133.3333, 2);
    expect(res.mitigatedExposurePM25).toBeCloseTo(113.3333, 2);
    expect(res.reductionPercentage).toBeCloseTo(15.0, 1); // wait, (3200 - 2720) / 3200 = 480 / 3200 = 0.15 = 15.0%
    expect(res.breakdown.outdoorReductionFraction).toBeCloseTo(0.6, 4);
    expect(res.breakdown.indoorReductionFraction).toBe(0);
  });

  it("handles zero PM2.5 safely without divide-by-zero or NaN (AC-005-b)", () => {
    const n95 = getActionById("n95_mask_commute")!;
    const profile: ImpactProfile = {
      outdoorHours: 2,
      outdoorPM25: 0,
      hasExistingPurifier: false,
    };

    const res = calculateImpact(profile, [n95]);

    expect(res.baselineExposurePM25).toBe(0);
    expect(res.mitigatedExposurePM25).toBe(0);
    expect(res.reductionPercentage).toBe(0);
    expect(res.baselineCigaretteEquivalents).toBe(0);
    expect(res.mitigatedCigaretteEquivalents).toBe(0);
    expect(res.cigarettesSavedPerDay).toBe(0);
    expect(Number.isNaN(res.reductionPercentage)).toBe(false);
  });

  it("computes cigarette-equivalents using Berkeley Earth 22 ug/m3 rule", () => {
    const hepa = getActionById("hepa_purifier_bedroom")!;
    const profile: ImpactProfile = {
      outdoorHours: 0,
      outdoorPM25: 220, // 24h indoor at 220 * 0.6 = 132 ug/m3 -> 132 / 22 = 6 cigarettes/day
      hasExistingPurifier: false,
    };

    const res = calculateImpact(profile, [hepa]);

    // Baseline: 132 ug/m3 = 6 cigarettes/day
    expect(res.baselineCigaretteEquivalents).toBeCloseTo(6.0, 2);
    // Hepa has 0.50 efficiency -> mitigated indoor = 132 * 0.5 = 66 ug/m3 = 3 cigarettes/day
    expect(res.mitigatedCigaretteEquivalents).toBeCloseTo(3.0, 2);
    expect(res.cigarettesSavedPerDay).toBeCloseTo(3.0, 2);
    expect(res.annualCigarettesAvoided).toBeCloseTo(3.0 * 365, 0);
  });

  it("includes legal/health caveat string", () => {
    const profile: ImpactProfile = {
      outdoorHours: 2,
      outdoorPM25: 150,
    };
    const res = calculateImpact(profile, []);
    expect(res.caveat.length).toBeGreaterThan(10);
    expect(res.caveat.toLowerCase()).toContain("not a medical");
  });

  it("clamps outdoor hours cleanly to 0-16 range", () => {
    const profileHigh: ImpactProfile = {
      outdoorHours: 24, // should be clamped to 16
      outdoorPM25: 100,
    };
    const resHigh = calculateImpact(profileHigh, []);

    const profileClamped16: ImpactProfile = {
      outdoorHours: 16,
      outdoorPM25: 100,
    };
    const res16 = calculateImpact(profileClamped16, []);

    expect(resHigh.baselineExposurePM25).toBeCloseTo(res16.baselineExposurePM25, 4);
  });

  it("models infiltration by homeType/purifier and computes cooking, lifestyle & CO2 impacts", () => {
    const sealedRes = calculateImpact({ outdoorHours: 0, outdoorPM25: 100, homeType: "sealed" }, []);
    const leakyRes = calculateImpact({ outdoorHours: 0, outdoorPM25: 100, homeType: "leaky" }, []);
    const purifierRes = calculateImpact(
      { outdoorHours: 0, outdoorPM25: 100, hasExistingPurifier: true },
      []
    );
    expect(purifierRes.baselineExposurePM25).toBeCloseTo(36, 1);
    expect(sealedRes.baselineExposurePM25).toBeCloseTo(40, 1);
    expect(leakyRes.baselineExposurePM25).toBeCloseTo(65, 1);

    const actions = [
      getActionById("carpool_public_transit")!,
      getActionById("switch_clean_fuel")!,
      getActionById("saline_nasal_rinse")!,
    ];
    const combinedRes = calculateImpact({ outdoorHours: 4, outdoorPM25: 150 }, actions);
    expect(combinedRes.co2SavedKgPerMonth).toBe(30); // 18 + 12 kg CO2
    expect(combinedRes.breakdown.cookingReductionFraction).toBeGreaterThan(0);
    expect(combinedRes.breakdown.outdoorReductionFraction).toBeGreaterThan(0);
    expect(combinedRes.breakdown.indoorReductionFraction).toBeGreaterThan(0);
  });
});
