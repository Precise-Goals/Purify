"use client";

import React, { useEffect, useState } from "react";
import {
  Wind,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Compass,
  Sparkles,
  AlertTriangle,
  Cpu,
  Sliders,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { AqiBadge } from "@/components/AqiBadge";
import { ImpactCard } from "@/components/ImpactCard";
import { PlanDisplay } from "@/components/PlanDisplay";
import type { PlanResponse } from "@/lib/pipeline";

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Form State
  const [city, setCity] = useState("Delhi");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [homeType, setHomeType] = useState<"standard" | "sealed" | "leaky">("standard");
  const [cookingFuel, setCookingFuel] = useState<"lpg_electric" | "biomass_wood" | "kerosene">("lpg_electric");
  const [commuteMode, setCommuteMode] = useState<"carpool_transit" | "walk_cycle" | "two_wheeler" | "personal_car">("carpool_transit");
  const [budget, setBudget] = useState<"low" | "medium" | "high">("medium");
  const [outdoorHours, setOutdoorHours] = useState(2);
  const [hasExistingPurifier, setHasExistingPurifier] = useState(false);
  const [notes, setNotes] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<PlanResponse | null>(null);

  // Load saved key on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("purify_gemini_key") || localStorage.getItem("breathewise_gemini_key");
      if (savedKey) {
        setApiKey(savedKey);
        setRememberKey(true);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const handleKeyChange = (val: string) => {
    setApiKey(val);
    if (rememberKey) {
      try {
        localStorage.setItem("purify_gemini_key", val);
      } catch {}
    }
  };

  const handleRememberToggle = (checked: boolean) => {
    setRememberKey(checked);
    try {
      if (checked && apiKey) {
        localStorage.setItem("purify_gemini_key", apiKey);
      } else {
        localStorage.removeItem("purify_gemini_key");
        localStorage.removeItem("breathewise_gemini_key");
      }
    } catch {}
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser. Please type your city name.");
      return;
    }
    setGpsLoading(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setCity(`GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setErrorMsg(`GPS access denied: ${err.message}. Please enter city name manually.`);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!apiKey.trim()) {
      setErrorMsg("Please supply your Gemini API Key in the panel below before generating an action plan.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": apiKey.trim(),
        },
        body: JSON.stringify({
          city: city.trim(),
          latitude,
          longitude,
          homeType,
          cookingFuel,
          commuteMode,
          budget,
          outdoorHours,
          hasExistingPurifier,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || `Error [${data.error || res.status}]`);
        setLoading(false);
        return;
      }

      setPlanResult(data as PlanResponse);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to communicate with server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Assistant Dashboard
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
              Interactive Execution
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Configure your household envelope to compute live ambient AQI and personalized deterministic mitigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-mono text-zinc-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GCP Pipeline: Ready</span>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-700 hover:text-rose-950 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Gemini API Key Panel */}
          <div className="bento-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="apiKey" className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-950" />
                <span>Your Gemini API Key</span>
                <span className="text-rose-500">*</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-zinc-950 hover:underline flex items-center gap-1"
              >
                <span>Free Key from Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-xs font-mono text-zinc-900 placeholder-zinc-400 pr-24"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-600 hover:text-zinc-950 px-2 py-1 rounded bg-zinc-100 border border-zinc-200"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={(e) => handleRememberToggle(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-950 focus:ring-0 w-3.5 h-3.5 accent-zinc-950"
                />
                <span className="text-[11px]">Save key in local browser storage</span>
              </label>

              <span className="text-[11px] text-zinc-700 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-zinc-950" />
                <span>Never stored on server</span>
              </span>
            </div>
          </div>

          {/* Household Exposure Profile Form */}
          <form onSubmit={handleSubmit} className="bento-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-950" />
                <span>Household & Exposure Profile</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Step 1 of 2</span>
            </div>

            {/* Location & GPS */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-800 flex items-center justify-between">
                <span>City / Smog Hub</span>
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={gpsLoading}
                  className="text-[11px] text-zinc-950 hover:underline font-mono flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" />
                  <span>{gpsLoading ? "Detecting GPS..." : "Auto-Detect via GPS"}</span>
                </button>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setLatitude(undefined);
                  setLongitude(undefined);
                }}
                placeholder="e.g. Delhi, Lahore, Beijing, Mumbai..."
                required
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 text-xs text-zinc-900"
              />
            </div>

            {/* Housing Envelope */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-800">
                Housing Envelope Air Sealing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "standard", label: "Standard" },
                  { id: "sealed", label: "Sealed" },
                  { id: "leaky", label: "Leaky" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setHomeType(type.id as any)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                      homeType === type.id
                        ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Outdoor Exposure Hours Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                <span>Daily Outdoor Commute / Exposure</span>
                <span className="font-mono text-zinc-950 font-bold">{outdoorHours} hours / day</span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="1"
                value={outdoorHours}
                onChange={(e) => setOutdoorHours(Number(e.target.value))}
                className="w-full accent-zinc-950 cursor-pointer"
              />
            </div>

            {/* Commute Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-800">
                Primary Commute Mode
              </label>
              <select
                value={commuteMode}
                onChange={(e) => setCommuteMode(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950"
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
                <label className="text-xs font-semibold text-zinc-800">Cooking Fuel</label>
                <select
                  value={cookingFuel}
                  onChange={(e) => setCookingFuel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950"
                >
                  <option value="lpg_electric">LPG / Induction</option>
                  <option value="biomass_wood">Biomass / Wood</option>
                  <option value="kerosene">Kerosene</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasExistingPurifier}
                    onChange={(e) => setHasExistingPurifier(e.target.checked)}
                    className="rounded border-zinc-300 text-zinc-950 focus:ring-0 w-3.5 h-3.5 accent-zinc-950"
                  />
                  <span>Have HEPA Purifier</span>
                </label>
              </div>
            </div>

            {/* Free-text Household Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-semibold text-zinc-800">Vulnerabilities / Household Notes</span>
                <span className="font-mono text-[10px]">{notes.length}/300</span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 300))}
                rows={2}
                placeholder="e.g. Infant 8 months old, asthmatic grandfather, morning running routine..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950"
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Deterministic Protocol...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Purify Action Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Results & Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!planResult && !loading && (
            <div className="bento-card rounded-2xl p-10 text-center space-y-4 border-dashed border-zinc-300">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 mx-auto flex items-center justify-center">
                <Wind className="w-6 h-6 text-zinc-950" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950">No Action Plan Generated Yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Enter your Gemini key and household profile on the left, then click Generate to trigger the 5-stage deterministic pipeline.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-md mx-auto text-left font-mono text-[10px]">
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 block">Stage 1</span>
                  <span className="text-zinc-950 font-semibold">Live AQI Fetch</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 block">Stage 2</span>
                  <span className="text-zinc-950 font-semibold">Gemini 2.5 AI</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 block">Stage 3</span>
                  <span className="text-zinc-950 font-semibold">Catalog Guard</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-500 block">Stage 4</span>
                  <span className="text-zinc-950 font-semibold">Impact Math</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="bento-card rounded-2xl p-12 text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider font-mono">
                  Executing Purify Pipeline...
                </h3>
                <p className="text-xs text-zinc-500">
                  Querying live pollutant sensor arrays, querying Gemini 2.5 Flash, and computing multi-compartment exposure equations.
                </p>
              </div>
            </div>
          )}

          {planResult && (
            <div className="space-y-6">
              {/* Stage 1: Ambient Air Quality Badge */}
              <AqiBadge air={planResult.air} />

              {/* Stage 2: Deterministic Impact Card */}
              <ImpactCard impact={planResult.impact} />

              {/* Stage 3: Personalized Action Plan */}
              <PlanDisplay
                summary={planResult.plan.summary}
                dailyRoutineTips={planResult.plan.dailyRoutineTips}
                actions={planResult.plan.actions}
              />

              {/* Stage 4: GCP & Pipeline Trace Telemetry Bento Card */}
              <div className="bento-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-950 uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Pipeline Execution Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-700 font-semibold">
                    Total: {planResult.trace.totalMs}ms
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-500 block">AQI Fetch</span>
                    <span className="text-zinc-950 font-semibold">{planResult.trace.stages.aqiMs}ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-500 block">Gemini 2.5</span>
                    <span className="text-zinc-950 font-semibold">{planResult.trace.stages.geminiMs}ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-500 block">Catalog Guard</span>
                    <span className="text-zinc-950 font-semibold">{planResult.trace.stages.validateMs}ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-500 block">Physics Model</span>
                    <span className="text-zinc-950 font-semibold">{planResult.trace.stages.impactMs}ms</span>
                  </div>
                </div>

                {planResult.trace.gcpStack && (
                  <div className="pt-2 border-t border-zinc-200/80 flex flex-wrap items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Runtime: {planResult.trace.gcpStack.runtime}</span>
                    <span>AI: {planResult.trace.gcpStack.model}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
