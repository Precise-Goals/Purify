import React from "react";
import type { ImpactResult } from "../lib/impact";
import { TrendingDown, Cigarette, Leaf, ShieldCheck, Info } from "lucide-react";

interface ImpactCardProps {
  impact: ImpactResult;
}

export const ImpactCard: React.FC<ImpactCardProps> = ({ impact }) => {
  const reductionPct = Math.min(100, Math.max(0, impact.reductionPercentage));
  const remainingPct = (100 - reductionPct).toFixed(1);

  return (
    <div className="bento-card rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
              Deterministic PM2.5 Exposure Impact
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-bold border border-zinc-200/90 font-mono">
              ISO Verified Arithmetic
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Physical multi-compartment mass-balance decay models, not hallucinated LLM guesses
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-800 font-semibold font-mono">
          <ShieldCheck className="w-4 h-4 text-zinc-950" />
          <span>Physics-Bound</span>
        </div>
      </div>

      {/* Primary Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Exposure Reduction */}
        <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Exposure Reduction</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-950 mt-2 font-mono tracking-tight">
            -{impact.reductionPercentage}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">
            {impact.baselineExposurePM25} → <span className="text-zinc-950 font-bold">{impact.mitigatedExposurePM25}</span> µg/m³
          </div>
        </div>

        {/* Cigarettes Avoided */}
        <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Cigarettes Avoided</span>
            <Cigarette className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-950 mt-2 font-mono tracking-tight">
            {impact.cigarettesSavedPerDay} <span className="text-xs text-zinc-500 font-normal">/ day</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">
            ≈ {impact.annualCigarettesAvoided} avoided / year
          </div>
        </div>

        {/* CO2 Mitigated */}
        <div className="p-4 rounded-xl bg-zinc-50/80 border border-zinc-200/80 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">CO2 Mitigated</span>
            <Leaf className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-950 mt-2 font-mono tracking-tight">
            {impact.co2SavedKgPerMonth} <span className="text-xs text-zinc-500 font-normal">kg/mo</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Transit & clean cooking swaps
          </div>
        </div>
      </div>

      {/* Visual Relative Exposure Progress Bar */}
      <div className="p-4 rounded-xl bg-zinc-50/60 border border-zinc-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-600">Mitigated Lung Burden:</span>
          <span className="text-zinc-950 font-bold">{remainingPct}% of Ambient Smog</span>
        </div>
        <div className="w-full h-3 bg-zinc-200/80 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-zinc-950 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, 100 - reductionPct)}%` }}
            title={`Mitigated Exposure: ${remainingPct}%`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>0 (Pure Air)</span>
          <span className="text-zinc-950 font-bold">-{reductionPct}% Harm Blocked</span>
          <span>100% (Ambient Unprotected)</span>
        </div>
      </div>

      {/* Transparent Disclaimer */}
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[11px]">
          <strong className="text-zinc-950 font-semibold">Methodology Disclaimer:</strong> {impact.caveat}
        </p>
      </div>
    </div>
  );
};
