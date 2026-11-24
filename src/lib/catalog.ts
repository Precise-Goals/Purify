/**
 * BreatheWise Curated Action Catalog
 * Single source of truth for smog mitigation interventions.
 * The LLM selects action IDs; deterministic arithmetic uses these efficiencies.
 */

export type ActionScope = "outdoor" | "indoor" | "cooking" | "commute" | "lifestyle";
export type ActionCostTier = "free" | "low" | "medium" | "high";

export interface CatalogAction {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly scope: ActionScope;
  readonly efficiency: number; // 0.0 to 1.0 (PM2.5 exposure reduction)
  readonly costTier: ActionCostTier;
  readonly approximateCostInr?: number;
  readonly tags: readonly string[];
}

export interface ValidateActionsResult {
  readonly validActions: CatalogAction[];
  readonly droppedIds: string[];
  readonly isEmpty: boolean;
  readonly errorCode?: "MODEL_EMPTY";
}

export const ACTION_CATALOG: readonly CatalogAction[] = [
  {
    id: "n95_mask_commute",
    title: "Wear N95/FFP2 Mask During Commute",
    description: "Well-fitted N95/FFP2 respirator reduces inhaled outdoor particulate matter significantly.",
    scope: "outdoor",
    efficiency: 0.6, // 60% effective exposure reduction accounting for realistic real-world fit loss
    costTier: "low",
    approximateCostInr: 150,
    tags: ["commute", "outdoor", "protective-gear", "low-budget"],
  },
  {
    id: "hepa_purifier_bedroom",
    title: "Run HEPA Air Purifier in Main Bedroom",
    description: "Continuous true-HEPA filtration captures fine particulates down to 0.3 microns during sleep.",
    scope: "indoor",
    efficiency: 0.5, // 50% indoor exposure reduction
    costTier: "high",
    approximateCostInr: 8500,
    tags: ["indoor", "appliance", "sleep", "bedroom"],
  },
  {
    id: "diy_box_fan_filter",
    title: "DIY Box-Fan Filter (Corsi-Rosenthal)",
    description: "Affordable box fan strapped with a MERV-13 furnace filter for low-cost indoor particulate removal.",
    scope: "indoor",
    efficiency: 0.4, // 40% indoor exposure reduction
    costTier: "low",
    approximateCostInr: 1800,
    tags: ["indoor", "diy", "low-budget", "filter"],
  },
  {
    id: "wet_mopping_daily",
    title: "Wet-Mop Floors Twice Daily",
    description: "Wet mopping prevents resuspension of settled toxic toxic smog dust into breathing zones.",
    scope: "indoor",
    efficiency: 0.15, // 15% indoor reduction of resuspended dust
    costTier: "free",
    approximateCostInr: 0,
    tags: ["indoor", "cleaning", "free", "routine"],
  },
  {
    id: "seal_windows_weatherstrip",
    title: "Seal Window Gaps with Weatherstripping",
    description: "Inexpensive foam/rubber draught strips reduce outdoor PM2.5 infiltration into living quarters.",
    scope: "indoor",
    efficiency: 0.25, // 25% reduction in infiltration
    costTier: "low",
    approximateCostInr: 350,
    tags: ["indoor", "home-improvement", "sealing"],
  },
  {
    id: "stagger_outdoor_exercise",
    title: "Reschedule / Relocate High-Exertion Exercise",
    description: "Shift running or heavy outdoor workouts to afternoon hours with lower ground-level smog or train indoors.",
    scope: "outdoor",
    efficiency: 0.7, // 70% reduction in high-ventilation outdoor smog inhalation
    costTier: "free",
    approximateCostInr: 0,
    tags: ["outdoor", "exercise", "free", "lifestyle"],
  },
  {
    id: "switch_clean_fuel",
    title: "Switch to Electric/LPG Cooking & Use Range Hood",
    description: "Eliminate solid biomass or unvented indoor kerosene fumes that compound outdoor smog levels.",
    scope: "cooking",
    efficiency: 0.4, // 40% reduction in indoor cooking particulate spikes
    costTier: "medium",
    approximateCostInr: 2500,
    tags: ["cooking", "indoor", "clean-energy"],
  },
  {
    id: "exhaust_fan_kitchen",
    title: "Run Kitchen Exhaust During & 15m After Cooking",
    description: "Expels combustion particles before they diffuse into bedrooms and main living spaces.",
    scope: "cooking",
    efficiency: 0.3,
    costTier: "low",
    approximateCostInr: 800,
    tags: ["cooking", "ventilation"],
  },
  {
    id: "carpool_public_transit",
    title: "Carpool or Switch to AC Metro/Bus",
    description: "Travel in sealed AC cabins with cabin air filtration to cut direct street-level tailpipe inhalation.",
    scope: "commute",
    efficiency: 0.35,
    costTier: "low",
    approximateCostInr: 50,
    tags: ["commute", "lifestyle", "eco-friendly"],
  },
  {
    id: "saline_nasal_rinse",
    title: "Daily Evening Saline Nasal Rinse",
    description: "Physically flushes trapped particulate matter and irritants from upper airway passages before sleep.",
    scope: "lifestyle",
    efficiency: 0.1,
    costTier: "low",
    approximateCostInr: 100,
    tags: ["lifestyle", "hygiene", "health"],
  },
  {
    id: "community_no_waste_burn",
    title: "RWA Waste & Leaf Burning Ban Vigilance",
    description: "Coordinate with neighbourhood society to stop local open refuse burning that causes hyper-local PM2.5 spikes.",
    scope: "lifestyle",
    efficiency: 0.2,
    costTier: "free",
    approximateCostInr: 0,
    tags: ["community", "rwa", "collective", "free"],
  },
];

const ACTION_INDEX: ReadonlyMap<string, CatalogAction> = new Map(
  ACTION_CATALOG.map((a) => [a.id, a])
);

/**
 * Retrieve a catalog action by its ID.
 */
export function getActionById(id: string): CatalogAction | undefined {
  return ACTION_INDEX.get(id);
}

/**
 * Retrieve the full list of catalog actions.
 */
export function getAllActions(): readonly CatalogAction[] {
  return ACTION_CATALOG;
}

/**
 * Validates a list of suggested action IDs from model output.
 * Deduplicates valid IDs, drops unknown IDs, and returns a structured result.
 * If zero valid actions remain, returns errorCode "MODEL_EMPTY".
 */
export function validateActionIds(rawIds: readonly string[]): ValidateActionsResult {
  const seenIds = new Set<string>();
  const validActions: CatalogAction[] = [];
  const droppedIds: string[] = [];

  for (const rawId of rawIds) {
    const trimmed = typeof rawId === "string" ? rawId.trim() : "";
    if (!trimmed) continue;

    const action = ACTION_INDEX.get(trimmed);
    if (action) {
      if (!seenIds.has(trimmed)) {
        seenIds.add(trimmed);
        validActions.push(action);
      }
    } else {
      if (!droppedIds.includes(trimmed)) {
        droppedIds.push(trimmed);
      }
    }
  }

  const isEmpty = validActions.length === 0;

  return {
    validActions,
    droppedIds,
    isEmpty,
    errorCode: isEmpty ? "MODEL_EMPTY" : undefined,
  };
}
