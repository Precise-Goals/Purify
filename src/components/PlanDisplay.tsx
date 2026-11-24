import React from "react";
import type { CatalogAction } from "../lib/catalog";

interface PlanDisplayProps {
  summary: string;
  dailyRoutineTips: string[];
  actions: CatalogAction[];
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({
  summary,
  dailyRoutineTips,
  actions,
}) => {
  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          Personalized Routine
        </h3>
        <p className="text-slate-700 leading-relaxed text-base font-medium">
          {summary}
        </p>

        {dailyRoutineTips.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Daily Actionable Protocol
            </h4>
            <ul className="space-y-2">
              {dailyRoutineTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-[#FF6A13] font-bold">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommended Interventions from Curated Catalog */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Curated Interventions ({actions.length})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Catalog-Bound Interventions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-[#0047AB]">
                    {action.scope}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    -{(action.efficiency * 100).toFixed(0)}% PM2.5
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{action.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  {action.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Cost: <strong className="capitalize text-slate-700">{action.costTier}</strong></span>
                {typeof action.approximateCostInr === "number" && (
                  <span>≈ ₹{action.approximateCostInr.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
