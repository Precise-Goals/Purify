import React from "react";
import Link from "next/link";
import { Wind, ShieldCheck, Cpu, Cloud, Database, ExternalLink, Activity, Sparkles } from "lucide-react";
import { GithubIcon } from "./GithubIcon";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Wind className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">Purify</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Form-first winter smog protection assistant. Pairing Google Gemini AI reasoning with deterministic physics equations for verifiably accurate PM2.5 mitigation.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BYO Gemini Key · Zero Server Storage</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Home (Overview & Infographics)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Assistant Dashboard (Interactive)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About Me & Purify Project
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Precise-Goals/Purify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Google Cloud Architecture */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Cloud Stack</span>
            </h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-slate-500" />
                <span>Google Cloud Run (Serverless)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Vertex AI / Gemini 2.5 Flash</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-teal-400" />
                <span>Google Maps Air Quality API</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-amber-400" />
                <span>Cloud Firestore & BigQuery</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Health Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Health Notice</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] leading-relaxed text-slate-400">
              <p>
                Impact metrics use the Berkeley Earth standard (22 µg/m³ PM2.5 = 1 cigarette/day) and physical stacking decay equations. Purify does not replace emergency medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Purify Clean Air Intelligence. Engineered for urban smog resilience.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Verified Deterministic Math
            </span>
            <span>Single Branch (main)</span>
            <span>Repo &lt; 10 MB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
