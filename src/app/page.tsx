import React from "react";
import Link from "next/link";
import {
  Wind,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingDown,
  Cigarette,
  Cpu,
  Cloud,
  Database,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { HourlyAqiChart } from "@/components/HourlyAqiChart";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/90 text-zinc-800 text-xs font-semibold font-mono tracking-wide shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
          <span>Google Cloud & Gemini 2.5 Flash Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 leading-tight">
          Purify Your Breath. <br />
          <span className="text-zinc-700 font-extrabold">
            Outsmart Urban Smog.
          </span>
        </h1>

        <p className="text-zinc-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Form-first, chat-free clean air intelligence. Pairing Google Gemini AI reasoning with rigorous physical exposure equations for deterministic PM2.5 protection.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-zinc-950 text-white font-bold text-sm shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <span>Open Assistant Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 font-semibold text-sm shadow-xs transition-all"
          >
            <Cpu className="w-4 h-4 text-zinc-950" />
            <span>Architecture & About Me</span>
          </Link>
        </div>
      </section>

      {/* 24-Hour Diurnal Smog Interactive Chart */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-zinc-950" />
              <span>Diurnal Urban Smog Simulation</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Explore how diurnal inversion spikes threaten major cities and how Purify mitigates the curve.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-600 hidden sm:inline-block">
            Atmospheric Boundary Layer Model
          </span>
        </div>

        <HourlyAqiChart />
      </section>

      {/* Bento Grid: Core Technical Innovations */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Engineered for Precision, Not Hallucination
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Standard AI chatbots invent random numbers. Purify restricts LLM reasoning to curated intervention IDs and executes deterministic physical arithmetic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Stacking Decay Physics */}
          <div className="bento-card rounded-2xl p-6 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Stacking Efficiency Mathematical Model</h3>
                  <p className="text-[11px] text-zinc-500">Multi-compartment physical exposure decay</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-full font-bold">
                Cap = 90%
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              When a user wears an N95 respirator outdoor (95% efficiency) and operates a HEPA purifier indoors (85% efficiency), benefits multiply non-linearly without double-counting:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                <div className="text-[10px] font-mono uppercase text-zinc-500 font-medium">Step 1: Outdoor N95</div>
                <div className="text-2xl font-black text-zinc-950 font-mono mt-1">95.0%</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Weighted by commute hrs</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                <div className="text-[10px] font-mono uppercase text-zinc-500 font-medium">Step 2: Indoor HEPA</div>
                <div className="text-2xl font-black text-zinc-950 font-mono mt-1">85.0%</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Applied to remaining air</div>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center">
                <div className="text-[10px] font-mono uppercase text-zinc-500 font-medium">Stacked Net Reduction</div>
                <div className="text-2xl font-black text-zinc-950 font-mono mt-1">88.5%</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Deterministic bound</div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Cigarette Equivalence */}
          <div className="bento-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-200/80 pb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                <Cigarette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Berkeley Earth Equivalence</h3>
                <p className="text-[11px] text-zinc-500">Translating PM2.5 to tangible harm</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                <div className="text-[10px] font-mono text-zinc-500">Physical Conversion Formula</div>
                <div className="text-xl font-black text-zinc-950 font-mono mt-1">22 µg/m³ = 1 Cigarette</div>
                <div className="text-[10px] text-zinc-500 mt-1">24-hour continuous breathing basis</div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                During 400 AQI smog episodes (≈350 µg/m³ PM2.5), an unprotected resident inhales the equivalent of <strong className="text-zinc-950">15.9 cigarettes daily</strong>. Purify cuts this below 1.5.
              </p>
            </div>
          </div>

          {/* Bento Card 3: Google Cloud (GCP) Pipeline Architecture */}
          <div className="bento-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-200/80 pb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">GCP Enterprise Stack</h3>
                <p className="text-[11px] text-zinc-500">Production Google Cloud modules</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-700">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
                <span><strong>Google Cloud Run:</strong> Serverless Edge hosting</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
                <span><strong>Vertex AI:</strong> Gemini 2.5 Flash reasoning</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
                <span><strong>Google Air Quality API:</strong> Sensor fusion</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
                <span><strong>Cloud Firestore & BigQuery:</strong> Analytics</span>
              </li>
            </ul>

            <Link
              href="/about#gcp"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-950 hover:underline pt-1"
            >
              <span>Inspect GCP Code Modules</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Bento Card 4: Form-First Zero Chat */}
          <div className="bento-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-200/80 pb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">Form-First Architecture</h3>
                <p className="text-[11px] text-zinc-500">Zero chat fatigue</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Conversational chatbots waste time asking tedious back-and-forth questions. Purify uses a structured 1-click form capturing housing envelope, commute hours, and vulnerability in one pass.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-zinc-700 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
              <span>Sub-second deterministic compilation</span>
            </div>
          </div>

          {/* Bento Card 5: Privacy & Zero Storage */}
          <div className="bento-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-200/80 pb-3">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">BYO Key Privacy Guard</h3>
                <p className="text-[11px] text-zinc-500">Client-side isolation</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Your Gemini API Key never touches our server disks or permanent logs. All calls use ephemeral in-memory processing. Redaction regexes ensure no token leakage.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-zinc-700 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-950" />
              <span>Zero telemetry logging of keys</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bento-card rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden bg-white/90 border border-zinc-200 shadow-sm">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            Ready to Protect Your Household?
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            Get your instant personalized action plan, live ambient AQI, and deterministic exposure reduction metrics right now.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <span>Launch Purify Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
