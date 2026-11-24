import React from "react";
import Link from "next/link";
import { Wind, ShieldCheck, Cpu, Cloud, Database, ExternalLink, Activity, Sparkles } from "lucide-react";
import { GithubIcon } from "./GithubIcon";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white/70 backdrop-blur-md border-t border-zinc-200/90 text-zinc-600 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                <Wind className="w-4 h-4 text-zinc-100" />
              </div>
              <span className="text-base font-black text-zinc-950 tracking-tight">Purify</span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed">
              Form-first winter smog protection assistant. Pairing Google Gemini AI reasoning with deterministic physics equations for verifiably accurate PM2.5 mitigation.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-800 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-950" />
              <span>BYO Gemini Key · Zero Server Storage</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-zinc-950 text-xs font-bold uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-zinc-950 transition-colors">
                  Home (Overview & Infographics)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-zinc-950 transition-colors">
                  Assistant Dashboard (Interactive)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-zinc-950 transition-colors">
                  About Me & Purify Project
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Precise-Goals/Purify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-zinc-950 transition-colors"
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
            <h4 className="text-zinc-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-zinc-700" />
              <span>Google Cloud Stack</span>
            </h4>
            <ul className="space-y-2 font-mono text-[11px] text-zinc-600">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-zinc-400" />
                <span>Google Cloud Run (Serverless)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-zinc-700" />
                <span>Vertex AI / Gemini 2.5 Flash</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-zinc-700" />
                <span>Google Maps Air Quality API</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-zinc-700" />
                <span>Cloud Firestore & BigQuery</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Health Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-zinc-950 text-xs font-bold uppercase tracking-wider">Health Notice</h4>
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] leading-relaxed text-zinc-600">
              <p>
                Impact metrics use the Berkeley Earth standard (22 µg/m³ PM2.5 = 1 cigarette/day) and physical stacking decay equations. Purify does not replace emergency medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} Purify Clean Air Intelligence. Engineered for urban smog resilience.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
