import React from "react";
import type { CatalogAction } from "../lib/catalog";
import { Sparkles, CheckCircle2, ShieldCheck, Tag, Layers } from "lucide-react";

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
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
              Personalized Smog Routine
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
            Gemini 2.5 Reasoned
          </span>
        </div>

        <p className="text-zinc-700 leading-relaxed text-sm">
          {summary}
        </p>

        {dailyRoutineTips.length > 0 && (
          <div className="pt-3 border-t border-zinc-200/80">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
              <span>Daily Action Protocol</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dailyRoutineTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700"
                >
                  <span className="w-5 h-5 rounded-full bg-zinc-950 text-white font-mono text-[10px] flex items-center justify-center shrink-0">
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 pb-3">
          <div>
            <h3 className="text-lg font-bold text-zinc-950 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-950" />
              <span>Curated Interventions ({actions.length})</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Strictly catalog-bound interventions. No hallucinated products.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-950" />
            <span>ISO Efficiency Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="p-4 rounded-xl border border-zinc-200/90 bg-white hover:border-zinc-400 hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 font-mono">
                    {action.scope}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                    -{(action.efficiency * 100).toFixed(0)}% PM2.5
                  </span>
                </div>

                <h4 className="font-bold text-zinc-950 text-sm group-hover:text-zinc-700 transition-colors">
                  {action.title}
                </h4>

                <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-zinc-400" />
                  <span className="capitalize">{action.costTier} Cost</span>
                </span>
                {typeof action.approximateCostInr === "number" && (
                  <span className="text-zinc-900 font-semibold">
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
