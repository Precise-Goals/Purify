import React from "react";
import type { ImpactResult } from "../lib/impact";

interface ImpactCardProps {
  impact: ImpactResult;
}

export const ImpactCard: React.FC<ImpactCardProps> = ({ impact }) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Deterministic PM2.5 Impact
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated via physical exposure equations, not AI estimates
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
          Verified Arithmetic
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Exposure Reduction
          </div>
          <div className="text-4xl font-black text-[#FF6A13] mt-1">
            {impact.reductionPercentage}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {impact.baselineExposurePM25} → {impact.mitigatedExposurePM25} µg/m³
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            Cigarettes Avoided / Day
          </div>
          <div className="text-4xl font-black text-[#0047AB] mt-1">
            {impact.cigarettesSavedPerDay}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            ≈ {impact.annualCigarettesAvoided} avoided annually
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase">
            CO2 Saved / Month
          </div>
          <div className="text-4xl font-black text-emerald-600 mt-1">
            {impact.co2SavedKgPerMonth} <span className="text-lg">kg</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">From transit & fuel swaps</div>
        </div>
      </div>

      <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
        ℹ️ <strong>Transparent Disclaimer:</strong> {impact.caveat}
      </div>
    </div>
  );
};
