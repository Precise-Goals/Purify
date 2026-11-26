"use client";

import React, { useEffect, useState } from "react";
import { Wind, AlertTriangle, Cpu } from "lucide-react";
import { AqiBadge } from "@/components/AqiBadge";
import { ImpactCard } from "@/components/ImpactCard";
import { PlanDisplay } from "@/components/PlanDisplay";
import { ApiKeyPanel } from "@/components/ApiKeyPanel";
import {
  HouseholdProfileForm,
  type HouseholdFormState,
} from "@/components/HouseholdProfileForm";
import type { PlanResponse } from "@/lib/pipeline";

const INITIAL_FORM_STATE: HouseholdFormState = {
  city: "Delhi",
  homeType: "standard",
  cookingFuel: "lpg_electric",
  commuteMode: "carpool_transit",
  budget: "medium",
  outdoorHours: 2,
  hasExistingPurifier: false,
  notes: "",
};

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const [form, setForm] = useState<HouseholdFormState>(INITIAL_FORM_STATE);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<PlanResponse | null>(null);

  useEffect(() => {
    try {
      const savedKey =
        localStorage.getItem("purify_gemini_key") ||
        localStorage.getItem("breathewise_gemini_key");
      if (savedKey) {
        setApiKey(savedKey);
        setRememberKey(true);
      }
    } catch {
      // localStorage may be unavailable in restricted contexts
    }
  }, []);

  const handleKeyChange = (val: string) => {
    setApiKey(val);
    if (rememberKey) {
      try {
        localStorage.setItem("purify_gemini_key", val);
      } catch {
        // Ignore storage quota errors
      }
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
    } catch {
      // Ignore storage removal errors
    }
  };

  const updateFormField = <K extends keyof HouseholdFormState>(
    field: K,
    value: HouseholdFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCityInputChange = (city: string) => {
    setForm((prev) => ({ ...prev, city }));
    setLatitude(undefined);
    setLongitude(undefined);
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
        setForm((prev) => ({
          ...prev,
          city: `GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`,
        }));
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
      setErrorMsg("Please supply your Gemini API Key before generating an action plan.");
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
          city: form.city.trim(),
          latitude,
          longitude,
          homeType: form.homeType,
          cookingFuel: form.cookingFuel,
          commuteMode: form.commuteMode,
          budget: form.budget,
          outdoorHours: form.outdoorHours,
          hasExistingPurifier: form.hasExistingPurifier,
          notes: form.notes.trim(),
        }),
      });

      const data = (await res.json()) as PlanResponse & { error?: string; message?: string };

      if (!res.ok) {
        setErrorMsg(data.message || `Error [${data.error || res.status}]`);
        return;
      }

      setPlanResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to communicate with server.";
      setErrorMsg(message);
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
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Configure your household envelope to compute live ambient AQI and personalized deterministic mitigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-mono text-zinc-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
            <span>GCP Pipeline: Ready</span>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs sm:text-sm flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-800 hover:text-rose-950 font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 rounded px-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <ApiKeyPanel
            apiKey={apiKey}
            showKey={showKey}
            rememberKey={rememberKey}
            onKeyChange={handleKeyChange}
            onToggleShowKey={() => setShowKey((prev) => !prev)}
            onToggleRemember={handleRememberToggle}
          />

          <HouseholdProfileForm
            form={form}
            loading={loading}
            gpsLoading={gpsLoading}
            onUpdateField={updateFormField}
            onCityInputChange={handleCityInputChange}
            onUseGps={handleUseGps}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right Column: Results & Telemetry */}
        <div className="lg:col-span-7 space-y-6">
          {!planResult && !loading && (
            <div className="bento-card rounded-2xl p-10 text-center space-y-4 border-dashed border-zinc-300">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 mx-auto flex items-center justify-center">
                <Wind className="w-6 h-6 text-zinc-950" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-zinc-950">No Action Plan Generated Yet</h2>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                  Enter your Gemini key and household profile on the left, then click Generate to trigger the 5-stage deterministic pipeline.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-md mx-auto text-left font-mono text-[10px]">
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-600 block">Stage 1</span>
                  <span className="text-zinc-950 font-semibold">Live AQI Fetch</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-600 block">Stage 2</span>
                  <span className="text-zinc-950 font-semibold">Gemini 3.5 AI</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-600 block">Stage 3</span>
                  <span className="text-zinc-950 font-semibold">Catalog Guard</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-600 block">Stage 4</span>
                  <span className="text-zinc-950 font-semibold">Impact Math</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="bento-card rounded-2xl p-12 text-center space-y-4 animate-pulse"
            >
              <div
                aria-hidden="true"
                className="w-12 h-12 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin mx-auto"
              />
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider font-mono">
                  Executing Purify Pipeline...
                </h2>
                <p className="text-xs text-zinc-600">
                  Querying live pollutant sensor arrays, running Gemini 3.5 reasoning, and computing multi-compartment exposure equations.
                </p>
              </div>
            </div>
          )}

          {planResult && (
            <div className="space-y-6">
              <AqiBadge air={planResult.air} />
              <ImpactCard impact={planResult.impact} />
              <PlanDisplay
                summary={planResult.plan.summary}
                dailyRoutineTips={planResult.plan.dailyRoutineTips}
                actions={planResult.plan.actions}
              />

              {/* GCP & Pipeline Trace Telemetry */}
              <section
                aria-label="Pipeline execution telemetry"
                className="bento-card rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-950 uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-zinc-950" aria-hidden="true" />
                    <span>Pipeline Execution Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-700 font-semibold">
                    Total: {planResult.trace.totalMs}ms
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-600 block">AQI Fetch</span>
                    <span className="text-zinc-950 font-semibold">{planResult.trace.stages.aqiMs}ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-600 block">Gemini AI</span>
                    <span className="text-zinc-950 font-semibold">{planResult.trace.stages.geminiMs}ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-600 block">Catalog Guard</span>
                    <span className="text-zinc-950 font-semibold">{planResult.trace.stages.validateMs}ms</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-600 block">Physics Model</span>
                    <span className="text-zinc-950 font-semibold">{planResult.trace.stages.impactMs}ms</span>
                  </div>
                </div>

                {planResult.trace.gcpStack && (
                  <div className="pt-2 border-t border-zinc-200/80 flex flex-wrap items-center justify-between text-[10px] text-zinc-600 font-mono">
                    <span>Runtime: {planResult.trace.gcpStack.runtime}</span>
                    <span>AI: {planResult.trace.gcpStack.model}</span>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
