/**
 * Deterministic PM2.5 Impact Model
 * Arithmetic formulas computing personal exposure reductions, cigarette equivalents,
 * and environmental savings from curated catalog interventions.
 */

import type { CatalogAction } from "./catalog";

export interface ImpactProfile {
  outdoorHours: number; // typical daily hours outdoors (clamped to 0-16)
  outdoorPM25: number;   // ambient outdoor PM2.5 concentration in µg/m³
  hasExistingPurifier?: boolean;
  homeType?: "sealed" | "standard" | "leaky";
}

export interface ImpactBreakdown {
  outdoorReductionFraction: number; // 0.0 to 0.90
  indoorReductionFraction: number;  // 0.0 to 0.90
  cookingReductionFraction: number; // 0.0 to 0.90
}

export interface ImpactResult {
  baselineExposurePM25: number;
  mitigatedExposurePM25: number;
  reductionPercentage: number;
  baselineCigaretteEquivalents: number;
  mitigatedCigaretteEquivalents: number;
  cigarettesSavedPerDay: number;
  annualCigarettesAvoided: number;
  co2SavedKgPerMonth: number;
  caveat: string;
  breakdown: ImpactBreakdown;
}

const BERKELEY_EARTH_UG_PER_CIGARETTE = 22.0;
const MAX_TOTAL_BENEFIT_FRACTION = 0.90; // 90% cap

/**
 * Calculates compound multiplicative reduction across actions in a single scope:
 * efficiency = 1 - (1 - e1) * (1 - e2) * ...
 * Capped at 90% (0.90).
 */
export function calculateStackingReduction(efficiencies: readonly number[]): number {
  if (efficiencies.length === 0) return 0;

  let remaining = 1.0;
  for (const eff of efficiencies) {
    const clampedEff = Math.max(0, Math.min(1, eff));
    remaining *= (1.0 - clampedEff);
  }

  const reduction = 1.0 - remaining;
  return Math.min(MAX_TOTAL_BENEFIT_FRACTION, Number(reduction.toFixed(4)));
}

/**
 * Determines indoor particulate infiltration fraction based on housing permeability
 * and existing air purifier presence.
 */
function getInfiltrationFraction(profile: ImpactProfile): number {
  if (profile.hasExistingPurifier) {
    return 0.36; // 36% infiltration with existing baseline purifier
  }
  switch (profile.homeType) {
    case "sealed":
      return 0.40;
    case "leaky":
      return 0.65;
    case "standard":
    default:
      return 0.60; // 60% infiltration in standard unsealed construction
  }
}

/**
 * Computes deterministic exposure impact and health equivalence metrics.
 */
export function calculateImpact(
  profile: ImpactProfile,
  actions: readonly CatalogAction[]
): ImpactResult {
  const outdoorPM = Math.max(0, profile.outdoorPM25 ?? 0);
  const outdoorHours = Math.max(0, Math.min(16, profile.outdoorHours ?? 2));
  const indoorHours = Math.max(0, 24 - outdoorHours);
  const infiltration = getInfiltrationFraction(profile);

  // Split actions by target scope
  const outdoorEffs: number[] = [];
  const indoorEffs: number[] = [];
  const cookingEffs: number[] = [];

  let co2Savings = 0;

  for (const action of actions) {
    switch (action.scope) {
      case "outdoor":
      case "commute":
        outdoorEffs.push(action.efficiency);
        break;
      case "indoor":
        indoorEffs.push(action.efficiency);
        break;
      case "cooking":
        cookingEffs.push(action.efficiency);
        // Cooking emissions compound indoor burden; apply partial indoor benefit
        indoorEffs.push(action.efficiency * 0.5);
        break;
      case "lifestyle":
        // General lifestyle/hygiene (e.g. saline rinse) provides modest overall boost
        outdoorEffs.push(action.efficiency * 0.5);
        indoorEffs.push(action.efficiency * 0.5);
        break;
    }

    if (action.id === "carpool_public_transit") {
      co2Savings += 18; // approx 18 kg CO2 saved per month
    } else if (action.id === "switch_clean_fuel") {
      co2Savings += 12; // approx 12 kg CO2 saved per month
    }
  }

  const outdoorReductionFraction = calculateStackingReduction(outdoorEffs);
  const indoorReductionFraction = calculateStackingReduction(indoorEffs);
  const cookingReductionFraction = calculateStackingReduction(cookingEffs);

  // Baseline 24h exposure
  const baselineOutdoorPM = outdoorPM;
  const baselineIndoorPM = outdoorPM * infiltration;
  const baselineExposurePM25 =
    (outdoorHours * baselineOutdoorPM + indoorHours * baselineIndoorPM) / 24.0;

  // Mitigated 24h exposure
  const mitigatedOutdoorPM = baselineOutdoorPM * (1.0 - outdoorReductionFraction);
  const mitigatedIndoorPM = baselineIndoorPM * (1.0 - indoorReductionFraction);
  const mitigatedExposurePM25 =
    (outdoorHours * mitigatedOutdoorPM + indoorHours * mitigatedIndoorPM) / 24.0;

  // Exposure reduction percentage
  let reductionPercentage = 0.0;
  if (baselineExposurePM25 > 0) {
    const rawReduction =
      ((baselineExposurePM25 - mitigatedExposurePM25) / baselineExposurePM25) * 100.0;
    reductionPercentage = Number(Math.max(0, Math.min(90, rawReduction)).toFixed(1));
  }

  // Berkeley Earth cigarette equivalent (22 µg/m³ = 1 cigarette/day)
  const baselineCigaretteEquivalents = Number(
    (baselineExposurePM25 / BERKELEY_EARTH_UG_PER_CIGARETTE).toFixed(1)
  );
  const mitigatedCigaretteEquivalents = Number(
    (mitigatedExposurePM25 / BERKELEY_EARTH_UG_PER_CIGARETTE).toFixed(1)
  );
  const cigarettesSavedPerDay = Number(
    Math.max(0, baselineCigaretteEquivalents - mitigatedCigaretteEquivalents).toFixed(1)
  );
  const annualCigarettesAvoided = Math.round(cigarettesSavedPerDay * 365);

  const caveat =
    "Approximate rule-of-thumb estimate based on Berkeley Earth equivalent models and typical filtration efficiencies. Not a medical device or formal clinical diagnosis.";

  return {
    baselineExposurePM25: Number(baselineExposurePM25.toFixed(2)),
    mitigatedExposurePM25: Number(mitigatedExposurePM25.toFixed(2)),
    reductionPercentage,
    baselineCigaretteEquivalents,
    mitigatedCigaretteEquivalents,
    cigarettesSavedPerDay,
    annualCigarettesAvoided,
    co2SavedKgPerMonth: co2Savings,
    caveat,
    breakdown: {
      outdoorReductionFraction,
      indoorReductionFraction,
      cookingReductionFraction,
    },
  };
}
