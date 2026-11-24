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
  Compass,
  CheckCircle2,
  ExternalLink,
  Flame,
} from "lucide-react";
import { HourlyAqiChart } from "@/components/HourlyAqiChart";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold font-mono tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Cloud & Gemini 2.5 Flash Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Purify Your Breath. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Outsmart Urban Smog.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Form-first, chat-free clean air intelligence. Pairing Google Gemini AI reasoning with rigorous physical exposure equations for deterministic PM2.5 protection.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Open Assistant Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 font-semibold text-sm transition-all"
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Architecture & About Me</span>
          </Link>
        </div>
      </section>

      {/* 24-Hour Diurnal Smog Interactive Chart */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Diurnal Urban Smog Simulation</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore how diurnal inversion spikes threaten major cities and how Purify mitigates the curve.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline-block">
            Atmospheric Boundary Layer Model
          </span>
        </div>

        <HourlyAqiChart />
      </section>

      {/* Bento Grid: Core Technical Innovations */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Engineered for Precision, Not Hallucination
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Standard AI chatbots invent random numbers. Purify restricts LLM reasoning to curated intervention IDs and executes deterministic physical arithmetic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Stacking Decay Physics */}
          <div className="bento-card bento-glow-emerald rounded-2xl p-6 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Stacking Efficiency Mathematical Model</h3>
                  <p className="text-[11px] text-slate-400">Multi-compartment physical exposure decay</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                Cap = 90%
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When a user wears an N95 respirator outdoor (95% efficiency) and operates a HEPA purifier indoors (85% efficiency), benefits multiply non-linearly without double-counting:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">Step 1: Outdoor N95</div>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1">95.0%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Weighted by commute hrs</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">Step 2: Indoor HEPA</div>
                <div className="text-xl font-black text-teal-400 font-mono mt-1">85.0%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Applied to remaining air</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">Stacked Net Reduction</div>
                <div className="text-xl font-black text-white font-mono mt-1">88.5%</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Deterministic bound</div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Cigarette Equivalence */}
          <div className="bento-card bento-glow-orange rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Cigarette className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Berkeley Earth Equivalence</h3>
                <p className="text-[11px] text-slate-400">Translating PM2.5 to tangible harm</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400">Physical Conversion Formula</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">22 µg/m³ = 1 Cigarette</div>
                <div className="text-[10px] text-slate-500 mt-1">24-hour continuous breathing basis</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                During 400 AQI smog episodes (≈350 µg/m³ PM2.5), an unprotected resident inhales the equivalent of <strong className="text-white">15.9 cigarettes daily</strong>. Purify cuts this below 1.5.
              </p>
            </div>
          </div>

          {/* Bento Card 3: Google Cloud (GCP) Pipeline Architecture */}
          <div className="bento-card bento-glow-cobalt rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Cloud className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">GCP Enterprise Stack</h3>
                <p className="text-[11px] text-slate-400">Production Google Cloud modules</p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Google Cloud Run:</strong> Serverless Edge hosting</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span><strong>Vertex AI:</strong> Gemini 2.5 Flash reasoning</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span><strong>Google Air Quality API:</strong> Sensor fusion</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Cloud Firestore & BigQuery:</strong> Analytics</span>
              </li>
            </ul>

            <Link
              href="/about#gcp"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-1"
            >
              <span>Inspect GCP Code Modules</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Bento Card 4: Form-First Zero Chat */}
          <div className="bento-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Form-First Architecture</h3>
                <p className="text-[11px] text-slate-400">Zero chat fatigue</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Conversational chatbots waste time asking tedious back-and-forth questions. Purify uses a structured 1-click form capturing housing envelope, commute hours, and vulnerability in one pass.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sub-second deterministic compilation</span>
            </div>
          </div>

          {/* Bento Card 5: Privacy & Zero Storage */}
          <div className="bento-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">BYO Key Privacy Guard</h3>
                <p className="text-[11px] text-slate-400">Client-side isolation</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your Gemini API Key never touches our server disks or permanent logs. All calls use ephemeral in-memory processing. Redaction regexes ensure no token leakage.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero telemetry logging of keys</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bento-card rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bento-glow-emerald pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Protect Your Household?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Get your instant personalized action plan, live ambient AQI, and deterministic exposure reduction metrics right now.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all"
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
