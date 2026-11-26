import { describe, expect, it } from "bun:test";
import {
  ACTION_CATALOG,
  getActionById,
  getAllActions,
  validateActionIds,
} from "../src/lib/catalog";

describe("catalog: ACTION_CATALOG inventory", () => {
  it("should contain at least 10 authoritative smog-mitigation actions", () => {
    expect(ACTION_CATALOG.length).toBeGreaterThanOrEqual(10);
  });

  it("every action should have valid efficiency between 0.0 and 1.0", () => {
    for (const action of ACTION_CATALOG) {
      expect(action.id).toBeDefined();
      expect(action.title.length).toBeGreaterThan(0);
      expect(action.efficiency).toBeGreaterThanOrEqual(0.0);
      expect(action.efficiency).toBeLessThanOrEqual(1.0);
      expect(["outdoor", "indoor", "cooking", "commute", "lifestyle"]).toContain(action.scope);
      expect(["free", "low", "medium", "high"]).toContain(action.costTier);
    }
  });

  it("includes documented anchor actions with exact efficiencies", () => {
    const n95 = getActionById("n95_mask_commute");
    expect(n95).toBeDefined();
    expect(n95?.efficiency).toBe(0.6); // 60% after fit loss

    const hepa = getActionById("hepa_purifier_bedroom");
    expect(hepa).toBeDefined();
    expect(hepa?.efficiency).toBe(0.5); // 50%

    const boxFan = getActionById("diy_box_fan_filter");
    expect(boxFan).toBeDefined();
    expect(boxFan?.efficiency).toBe(0.4); // 40%
  });
});

describe("catalog: validateActionIds (AC-004-a)", () => {
  it("returns valid catalog actions for valid IDs", () => {
    const res = validateActionIds(["n95_mask_commute", "hepa_purifier_bedroom"]);
    expect(res.isEmpty).toBe(false);
    expect(res.validActions.length).toBe(2);
    expect(res.droppedIds).toEqual([]);
    expect(res.errorCode).toBeUndefined();
  });

  it("drops unknown/hallucinated IDs (AC-004-a)", () => {
    const res = validateActionIds([
      "n95_mask_commute",
      "magic_quantum_air_crystal", // unknown
      "hepa_purifier_bedroom",
      "invented_action_123",        // unknown
    ]);
    expect(res.validActions.length).toBe(2);
    expect(res.validActions.map((a) => a.id)).toEqual([
      "n95_mask_commute",
      "hepa_purifier_bedroom",
    ]);
    expect(res.droppedIds).toEqual([
      "magic_quantum_air_crystal",
      "invented_action_123",
    ]);
    expect(res.isEmpty).toBe(false);
  });

  it("deduplicates repeated valid action IDs", () => {
    const res = validateActionIds([
      "n95_mask_commute",
      "n95_mask_commute",
      "hepa_purifier_bedroom",
    ]);
    expect(res.validActions.length).toBe(2);
    expect(res.validActions.map((a) => a.id)).toEqual([
      "n95_mask_commute",
      "hepa_purifier_bedroom",
    ]);
  });

  it("returns MODEL_EMPTY if all action IDs are invalid (AC-004-a)", () => {
    const res = validateActionIds(["fake_action_1", "fake_action_2"]);
    expect(res.validActions).toEqual([]);
    expect(res.droppedIds).toEqual(["fake_action_1", "fake_action_2"]);
    expect(res.isEmpty).toBe(true);
    expect(res.errorCode).toBe("MODEL_EMPTY");
  });

  it("exposes complete catalog via getAllActions and handles non-string/whitespace inputs", () => {
    const all = getAllActions();
    expect(all.length).toBe(ACTION_CATALOG.length);

    const res = validateActionIds(["  n95_mask_commute  ", "", "   "]);
    expect(res.validActions.map((a) => a.id)).toEqual(["n95_mask_commute"]);
    expect(res.droppedIds).toEqual([]);
  });

  it("returns MODEL_EMPTY if input list is empty", () => {
    const res = validateActionIds([]);
    expect(res.validActions).toEqual([]);
    expect(res.isEmpty).toBe(true);
    expect(res.errorCode).toBe("MODEL_EMPTY");
  });
});
