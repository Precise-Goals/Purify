"use client";

import React, { useEffect, useState } from "react";
import { AqiBadge } from "@/components/AqiBadge";
import { ImpactCard } from "@/components/ImpactCard";
import { PlanDisplay } from "@/components/PlanDisplay";
import type { PlanResponse } from "@/lib/pipeline";

export default function HomePage() {
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
      const savedKey = localStorage.getItem("breathewise_gemini_key");
      if (savedKey) {
        setApiKey(savedKey);
        setRememberKey(true);
      }
    } catch {
      // localStorage may be disabled
    }
  }, []);

  const handleKeyChange = (val: string) => {
    setApiKey(val);
    if (rememberKey) {
      try {
        localStorage.setItem("breathewise_gemini_key", val);
      } catch {}
    }
  };

  const handleRememberToggle = (checked: boolean) => {
    setRememberKey(checked);
    try {
      if (checked && apiKey) {
        localStorage.setItem("breathewise_gemini_key", apiKey);
      } else {
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
      setErrorMsg("Please supply your Gemini API Key in the field above before requesting a plan.");
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
    <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Brand Header */}
      <header className="border-b-2 border-slate-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌬️</span>
              <h1 className="text-3xl sm:text-4xl font-black text-[#00245E] tracking-tight">
                Breathe<span className="text-[#FF6A13]">Wise</span>
              </h1>
            </div>
            <p className="text-slate-600 text-sm mt-1 max-w-xl font-medium">
              Form-first, chat-free Gemini AI winter smog protection. Personalized routines, affordable hacks, and deterministic PM2.5 exposure metrics.
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-200/70 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider">
              BYO-Key Architecture
            </span>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm flex items-start gap-3">
          <span className="text-lg">❌</span>
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Gemini API Key Panel */}
      <section className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="apiKey" className="text-sm font-bold text-slate-800 flex items-center gap-2">
            🔑 Your Gemini API Key <span className="text-rose-500">*</span>
          </label>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#0047AB] hover:underline"
          >
            Get Free Key from Google AI Studio →
          </a>
        </div>

        <div className="relative">
          <input
            id="apiKey"
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047AB] text-sm font-mono pr-24"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 px-2.5 py-1 hover:bg-slate-100 rounded-lg"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => handleRememberToggle(e.target.checked)}
              className="rounded border-slate-300 text-[#0047AB] focus:ring-[#0047AB]"
            />
            Remember key on this browser
          </label>
          <span className="italic">Key is never stored or logged on our server</span>
        </div>
      </section>

      {/* Household Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Household & Smog Profile
        </h2>

        {/* Location Section */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800">
            City or Region
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setLatitude(undefined);
                setLongitude(undefined);
              }}
              placeholder="e.g. Delhi, Lahore, Beijing, Mumbai"
              required
              className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0047AB] text-sm"
            />
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              📍 {gpsLoading ? "Locating..." : "Use GPS"}
            </button>
          </div>
        </div>

        {/* Housing & Lifestyle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Home Permeability
            </label>
            <select
              value={homeType}
              onChange={(e) => setHomeType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="standard">Standard (Typical city apartment/house)</option>
              <option value="sealed">Sealed (Tight weatherproofing, double glass)</option>
              <option value="leaky">Leaky (Gaps around doors/windows, older build)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Cooking Fuel
            </label>
            <select
              value={cookingFuel}
              onChange={(e) => setCookingFuel(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="lpg_electric">LPG / Piped Gas / Electric Induction</option>
              <option value="biomass_wood">Biomass / Wood / Coal Chulha</option>
              <option value="kerosene">Kerosene stove</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Commute Style
            </label>
            <select
              value={commuteMode}
              onChange={(e) => setCommuteMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="carpool_transit">Metro / Bus / Carpool</option>
              <option value="two_wheeler">Two-wheeler / Motorcycle / Scooter</option>
              <option value="walk_cycle">Walking / Cycling</option>
              <option value="personal_car">Personal Car (AC)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Solution Budget Preference
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="low">Low Budget (Free hacks, DIY filters, wet mopping)</option>
              <option value="medium">Medium (N95 masks, window seal strips)</option>
              <option value="high">High (True-HEPA purifiers, commercial filters)</option>
            </select>
          </div>
        </div>

        {/* Outdoor Hours Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Average Daily Outdoor Exposure:</span>
            <span className="text-[#FF6A13]">{outdoorHours} hours / day</span>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            value={outdoorHours}
            onChange={(e) => setOutdoorHours(parseInt(e.target.value, 10))}
            className="w-full accent-[#FF6A13]"
          />
        </div>

        {/* Existing Purifier Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="purifier"
            type="checkbox"
            checked={hasExistingPurifier}
            onChange={(e) => setHasExistingPurifier(e.target.checked)}
            className="rounded border-slate-300 text-[#0047AB] focus:ring-[#0047AB]"
          />
          <label htmlFor="purifier" className="text-sm font-semibold text-slate-800 cursor-pointer">
            Household already owns at least one operating air purifier
          </label>
        </div>

        {/* Free text notes */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Special Household Context / Vulnerable Members (optional)</span>
            <span className="text-slate-400">{notes.length}/300</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 300))}
            rows={2}
            placeholder="e.g. 4-year-old child with morning wheezing, grandmother with asthma"
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0047AB] text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#FF6A13] hover:bg-[#e05a0b] active:scale-[0.99] transition-all text-white font-black text-base rounded-xl shadow-md disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Generating Tailored Routine..." : "Generate Action Plan & Quantified Impact →"}
        </button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="h-56 bg-slate-200 rounded-2xl" />
        </div>
      )}

      {/* Plan Results View */}
      {planResult && !loading && (
        <section className="space-y-6">
          <AqiBadge air={planResult.air} />
          <ImpactCard impact={planResult.impact} />
          <PlanDisplay
            summary={planResult.plan.summary}
            dailyRoutineTips={planResult.plan.dailyRoutineTips}
            actions={planResult.plan.actions}
          />

          {/* Execution Trace Telemetry */}
          <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200/60 flex flex-wrap justify-center gap-4">
            <span>AQI: {planResult.trace.stages.aqiMs}ms</span>
            <span>Gemini: {planResult.trace.stages.geminiMs}ms</span>
            <span>Impact Arithmetic: {planResult.trace.stages.impactMs}ms</span>
            <span className="font-bold">Total: {planResult.trace.totalMs}ms</span>
          </footer>
        </section>
      )}
    </main>
  );
}
