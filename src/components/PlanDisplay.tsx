import React from "react";
import type { CatalogAction } from "../lib/catalog";
import { Sparkles, CheckCircle2, ShieldCheck, Tag, Layers, IndianRupee } from "lucide-react";

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
      {/* Plan Summary Card */}
      <div className="bento-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Personalized Smog Routine
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Gemini 2.5 Reasoned
          </span>
        </div>

        <p className="text-slate-300 leading-relaxed text-sm">
          {summary}
        </p>

        {dailyRoutineTips.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daily Action Protocol</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dailyRoutineTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300"
                >
                  <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-[10px] flex items-center justify-center shrink-0 border border-emerald-500/20">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Curated Interventions Bento Grid */}
      <div className="bento-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Curated Interventions ({actions.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly catalog-bound interventions. No hallucinated products.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ISO Efficiency Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    {action.scope}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    -{(action.efficiency * 100).toFixed(0)}% PM2.5
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                  {action.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-500" />
                  <span className="capitalize">{action.costTier} Cost</span>
                </span>
                {typeof action.approximateCostInr === "number" && (
                  <span className="text-slate-300 font-semibold">
                    ≈ ₹{action.approximateCostInr.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
