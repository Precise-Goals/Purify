import React from "react";
import { Compass, RefreshCw, Sliders, Sparkles } from "lucide-react";
import type { BudgetTier, CommuteMode, CookingFuel, HomeType } from "@/lib/sanitize";

export interface HouseholdFormState {
  city: string;
  homeType: HomeType;
  cookingFuel: CookingFuel;
  commuteMode: CommuteMode;
  budget: BudgetTier;
  outdoorHours: number;
  hasExistingPurifier: boolean;
  notes: string;
}

interface HouseholdProfileFormProps {
  form: HouseholdFormState;
  loading: boolean;
  gpsLoading: boolean;
  onUpdateField: <K extends keyof HouseholdFormState>(
    field: K,
    value: HouseholdFormState[K]
  ) => void;
  onCityInputChange: (city: string) => void;
  onUseGps: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const HOME_TYPE_OPTIONS: readonly { id: HomeType; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "sealed", label: "Sealed" },
  { id: "leaky", label: "Leaky" },
];

const BUDGET_OPTIONS: readonly { id: BudgetTier; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

/**
 * Form-first structured household exposure & mitigation profile form.
 */
export const HouseholdProfileForm: React.FC<HouseholdProfileFormProps> = ({
  form,
  loading,
  gpsLoading,
  onUpdateField,
  onCityInputChange,
  onUseGps,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="bento-card rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-950" aria-hidden="true" />
          <span>Household & Exposure Profile</span>
        </h2>
        <span className="text-[10px] font-mono text-zinc-600">Step 1 of 2</span>
      </div>

      {/* Location & GPS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="cityInput" className="text-xs font-semibold text-zinc-800">
            City / Smog Hub
          </label>
          <button
            type="button"
            onClick={onUseGps}
            disabled={gpsLoading}
            className="text-[11px] text-zinc-950 hover:underline font-mono flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
          >
            <Compass className="w-3 h-3" aria-hidden="true" />
            <span>{gpsLoading ? "Detecting GPS..." : "Auto-Detect via GPS"}</span>
          </button>
        </div>
        <input
          id="cityInput"
          type="text"
          value={form.city}
          onChange={(e) => onCityInputChange(e.target.value)}
          placeholder="e.g. Delhi, Lahore, Beijing, Mumbai..."
          required
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-950/30 focus:border-zinc-950 text-xs text-zinc-950 placeholder-zinc-500"
        />
      </div>

      {/* Housing Envelope */}
      <div className="space-y-2">
        <span id="homeTypeLabel" className="text-xs font-semibold text-zinc-800 block">
          Housing Envelope Air Sealing
        </span>
        <div role="group" aria-labelledby="homeTypeLabel" className="grid grid-cols-3 gap-2">
          {HOME_TYPE_OPTIONS.map((option) => {
            const active = form.homeType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => onUpdateField("homeType", option.id)}
                className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${
                  active
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Tier */}
      <div className="space-y-2">
        <span id="budgetTierLabel" className="text-xs font-semibold text-zinc-800 block">
          Intervention Budget Tier
        </span>
        <div role="group" aria-labelledby="budgetTierLabel" className="grid grid-cols-3 gap-2">
          {BUDGET_OPTIONS.map((option) => {
            const active = form.budget === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => onUpdateField("budget", option.id)}
                className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${
                  active
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outdoor Exposure Hours Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
          <label htmlFor="outdoorHoursSlider">Daily Outdoor Commute / Exposure</label>
          <span className="font-mono text-zinc-950 font-bold">{form.outdoorHours} hours / day</span>
        </div>
        <input
          id="outdoorHoursSlider"
          type="range"
          min={0}
          max={16}
          step={1}
          value={form.outdoorHours}
          aria-valuetext={`${form.outdoorHours} hours per day`}
          onChange={(e) => onUpdateField("outdoorHours", Number(e.target.value))}
          className="w-full accent-zinc-950 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
        />
      </div>

      {/* Commute Mode */}
      <div className="space-y-2">
        <label htmlFor="commuteModeSelect" className="text-xs font-semibold text-zinc-800 block">
          Primary Commute Mode
        </label>
        <select
          id="commuteModeSelect"
          value={form.commuteMode}
          onChange={(e) => onUpdateField("commuteMode", e.target.value as CommuteMode)}
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/30 focus:border-zinc-950"
        >
          <option value="carpool_transit">Public Transit / Metro / Bus</option>
          <option value="walk_cycle">Walking / Bicycle</option>
          <option value="two_wheeler">Two-Wheeler / Motorbike</option>
          <option value="personal_car">Personal Car with AC</option>
        </select>
      </div>

      {/* Cooking Fuel & Purifier Check */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <label htmlFor="cookingFuelSelect" className="text-xs font-semibold text-zinc-800 block">
            Cooking Fuel
          </label>
          <select
            id="cookingFuelSelect"
            value={form.cookingFuel}
            onChange={(e) => onUpdateField("cookingFuel", e.target.value as CookingFuel)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/30 focus:border-zinc-950"
          >
            <option value="lpg_electric">LPG / Induction</option>
            <option value="biomass_wood">Biomass / Wood</option>
            <option value="kerosene">Kerosene</option>
          </select>
        </div>

        <div className="space-y-1.5 flex flex-col justify-end">
          <label
            htmlFor="hasExistingPurifierCheck"
            className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 cursor-pointer select-none"
          >
            <input
              id="hasExistingPurifierCheck"
              type="checkbox"
              checked={form.hasExistingPurifier}
              onChange={(e) => onUpdateField("hasExistingPurifier", e.target.checked)}
              className="rounded border-zinc-300 text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 w-3.5 h-3.5 accent-zinc-950"
            />
            <span>Have HEPA Purifier</span>
          </label>
        </div>
      </div>

      {/* Free-text Household Notes */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <label htmlFor="householdNotes" className="font-semibold text-zinc-800">
            Vulnerabilities / Household Notes
          </label>
          <span className="font-mono text-[10px]" aria-live="polite">
            {form.notes.length}/300
          </span>
        </div>
        <textarea
          id="householdNotes"
          value={form.notes}
          onChange={(e) => onUpdateField("notes", e.target.value.slice(0, 300))}
          rows={2}
          maxLength={300}
          placeholder="e.g. Infant 8 months old, asthmatic grandfather, morning running routine..."
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-zinc-950 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950/30 focus:border-zinc-950"
        />
      </div>

      {/* Submit Action Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Computing Deterministic Protocol...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Generate Purify Action Plan</span>
          </>
        )}
      </button>
    </form>
  );
};
