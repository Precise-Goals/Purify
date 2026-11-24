"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wind,
  User,
  HeartPulse,
  ShieldCheck,
  Cpu,
  Cloud,
  Database,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Terminal,
  Activity,
  FileCode,
} from "lucide-react";
import { PURIFY_GCP_STACK } from "@/lib/gcp";

const GCP_CODE_SNIPPETS = {
  vertex: `// src/lib/gcp/vertex.ts
import { VertexAIService } from "./vertex";

const vertex = new VertexAIService({
  projectId: "purify-gcp-production",
  location: "us-central1",
  modelName: "gemini-2.5-flash",
});

// Generates structured recommendations via Gemini 2.5 Flash with strict JSON schema
export async function generatePlan(prompt: string) {
  return await vertex.generateStructuredPlan(prompt, {
    temperature: 0.2,
    maxOutputTokens: 1024,
  });
}`,
  airquality: `// src/lib/gcp/airquality.ts
import { GoogleAirQualityClient } from "./airquality";

const client = new GoogleAirQualityClient(process.env.GOOGLE_MAPS_API_KEY);

// Queries Google Maps Air Quality API current conditions
export async function fetchLiveAir(lat: number, lng: number) {
  return await client.getCurrentConditions({
    latitude: lat,
    longitude: lng,
    extraComputations: [
      "HEALTH_RECOMMENDATIONS",
      "DOMINANT_POLLUTANT_CONCENTRATION",
      "POLLUTANT_CONCENTRATION",
      "LOCAL_AQI"
    ],
  });
}`,
  firestore: `// src/lib/gcp/firestore.ts
import { FirestoreAuditService } from "./firestore";

const firestore = new FirestoreAuditService();

// Anonymously logs plan calculation without storing keys or PII
export async function logTelemetry(event: TelemetryDocument) {
  return await firestore.logAnonymizedEvent({
    sessionId: event.sessionId,
    city: event.city,
    aqi: event.aqi,
    pm25: event.pm25,
    reductionPercentage: event.reductionPercentage,
    latencyMs: event.latencyMs,
  });
}`,
  pubsub: `// src/lib/gcp/pubsub.ts
import { PubSubPublisher } from "./pubsub";

const publisher = new PubSubPublisher("purify-severe-smog-alerts");

// Dispatches asynchronous hazard events (AQI >= 300) to subscriber topics
export async function alertSmogSpike(city: string, aqi: number, pm25: number) {
  return await publisher.publishEvent({
    city,
    aqi,
    pm25,
    severity: "CRITICAL",
    timestamp: new Date().toISOString(),
  });
}`,
  bigquery: `// src/lib/gcp/bigquery.ts
import { BigQueryAnalyticsService } from "./bigquery";

const bigquery = new BigQueryAnalyticsService();

// Streams cohort exposure mitigations for environmental epidemiology
export async function recordMitigation(record: BigQuerySmogRecord) {
  return await bigquery.streamRecord(record);
}`,
};

export default function AboutPage() {
  const [activeCodeTab, setActiveCodeTab] = useState<keyof typeof GCP_CODE_SNIPPETS>("vertex");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header / Hero */}
      <section className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          <Terminal className="w-3.5 h-3.5" />
          <span>Mission & Architecture Deep-Dive</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Engineering Clean Air Intelligence
        </h1>

        <p className="text-slate-400 text-base leading-relaxed">
          The backstory, design philosophy, and enterprise Google Cloud Platform (GCP) architecture behind the Purify system.
        </p>
      </section>

      {/* Bento Grid Section 1: About Me & About Purify */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* About Me Bento Card (5 cols) */}
        <div className="md:col-span-5 bento-card bento-glow-emerald rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <User className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">About Me</h2>
              <p className="text-xs text-slate-400 font-mono">Creator & Systems Engineer</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <p>
              I built <strong className="text-white">Purify</strong> out of personal necessity and engineering conviction. Having lived through severe winter atmospheric inversions where outdoor AQI breached <span className="text-rose-400 font-mono font-bold">500+ µg/m³</span>, I watched vulnerable family members struggle with acute bronchial distress.
            </p>

            <p>
              When consulting modern LLMs for advice, I was shocked by the prevalence of <strong className="text-white">unbounded AI hallucinations</strong>: chatbots confidently inventing imaginary air filter specs, recommending deep breathing outdoors during particulate emergencies, or citing fake reduction percentages.
            </p>

            <p>
              My goal was simple: <strong className="text-emerald-400">Never let an LLM do arithmetic.</strong> Build an assistant where generative AI synthesizes user personas, but authoritative physical laws calculate exposure reduction.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Deterministic Philosophy</span>
            </span>
            <a
              href="https://github.com/Precise-Goals/Purify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* About Purify Project Bento Card (7 cols) */}
        <div className="md:col-span-7 bento-card bento-glow-cobalt rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wind className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">About Purify Project</h2>
              <p className="text-xs text-slate-400 font-mono">Form-First Smog Protection Architecture</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Purify is structured around a strict 5-stage pipeline designed to provide immediate, actionable smog protection without chat fatigue:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Form-First Synthesis</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Gathers housing envelope, commute hours, and vulnerability in one 1-click payload.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Sensor Grounding</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Fetches hyper-local ambient AQI & PM2.5 from Google Maps Air Quality API with 10-minute caching.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Catalog Hallucination Guard</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Gemini 2.5 selects candidate action IDs; ungrounded IDs are discarded by runtime validation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. Physical Exposure Math</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Stacking non-linear decay models compute exact PM2.5 exposure and Berkeley Earth cigarette equivalence.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Ready to test your location?</span>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Go to Assistant Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Google Cloud Platform (GCP) Architecture Blueprint */}
      <section id="gcp" className="space-y-8 scroll-mt-20">
        <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-400" />
              <span>Google Cloud Platform (GCP) Pipeline Architecture</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Engineered using the Google Cloud ecosystem for high-concurrency, low-latency clean air intelligence.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Enterprise Blueprint
          </span>
        </div>

        {/* GCP Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PURIFY_GCP_STACK.map((item) => (
            <div
              key={item.service}
              className="bento-card rounded-2xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.category}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title={item.status} />
                </div>
                <h3 className="text-base font-bold text-white">{item.service}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {item.roleInPurify}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Production Architecture Ready</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive GCP Code Snippets Inspector */}
        <div className="bento-card rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                GCP Code Implementation Modules
              </h3>
            </div>

            {/* Code Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(Object.keys(GCP_CODE_SNIPPETS) as Array<keyof typeof GCP_CODE_SNIPPETS>).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    activeCodeTab === tab
                      ? "bg-emerald-500 text-slate-950 shadow"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {tab}.ts
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-slate-300">src/lib/gcp/{activeCodeTab}.ts</span>
              </div>
              <span>TypeScript 5.7</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
              <code>{GCP_CODE_SNIPPETS[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer Navigation CTA */}
      <section className="text-center pt-8 border-t border-slate-800">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <span>Launch Purify Assistant</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
