"use client";

import React, { useState } from "react";
import { Activity, TrendingDown, Clock, ShieldCheck, Info } from "lucide-react";

interface CityData {
  name: string;
  country: string;
  baselinePeak: number;
  curve: number[]; // 24 hours of PM2.5 (µg/m³)
  narrative: string;
}

const CITY_DIURNAL_DATA: Record<string, CityData> = {
  delhi: {
    name: "Delhi",
    country: "India",
    baselinePeak: 385,
    curve: [
      260, 280, 295, 310, 340, 385, 360, 290, 210, 160, 140, 130,
      125, 135, 150, 180, 230, 290, 330, 350, 360, 340, 300, 275,
    ],
    narrative: "Severe winter inversion traps vehicular exhaust and biomass emissions beneath a low planetary boundary layer during early morning and late night.",
  },
  lahore: {
    name: "Lahore",
    country: "Pakistan",
    baselinePeak: 420,
    curve: [
      290, 310, 330, 360, 395, 420, 380, 310, 230, 175, 150, 140,
      135, 145, 165, 205, 260, 320, 370, 390, 405, 380, 330, 305,
    ],
    narrative: "Stagnant anticyclonic conditions create toxic episodic smog spikes with PM2.5 concentrations reaching hazardous thresholds exceeding 400 µg/m³.",
  },
  beijing: {
    name: "Beijing",
    country: "China",
    baselinePeak: 195,
    curve: [
      110, 120, 135, 150, 175, 195, 180, 145, 105, 80, 65, 60,
      55, 60, 70, 90, 120, 150, 170, 185, 175, 150, 130, 115,
    ],
    narrative: "Mountain basin topography traps north-moving industrial plumes until strong cold-front winds flush the atmospheric basin.",
  },
  london: {
    name: "London",
    country: "UK",
    baselinePeak: 45,
    curve: [
      18, 16, 15, 18, 26, 42, 45, 38, 28, 22, 20, 19,
      18, 20, 24, 32, 41, 44, 36, 28, 25, 22, 20, 19,
    ],
    narrative: "Mild modern background with localized peaks during rush hour traffic along arterial corridors.",
  },
};

export const HourlyAqiChart: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>("delhi");
  const [selectedHour, setSelectedHour] = useState<number>(8); // 8 AM rush

  const city = CITY_DIURNAL_DATA[selectedCity] || CITY_DIURNAL_DATA.delhi;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxVal = Math.max(...city.curve) * 1.15;

  // Assume 82% average reduction via Purify multi-compartment mitigation (N95 outdoor + Room HEPA indoor)
  const mitigatedCurve = city.curve.map((val) => Math.round(val * 0.18));

  const ambientVal = city.curve[selectedHour];
  const mitigatedVal = mitigatedCurve[selectedHour];
  const hourString = `${selectedHour.toString().padStart(2, "0")}:00`;

  // SVG chart dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Path generator
  const getCoordinates = (val: number, idx: number) => {
    const x = paddingX + (idx / 23) * chartWidth;
    const y = paddingY + chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  };

  const ambientPoints = city.curve.map((val, i) => getCoordinates(val, i));
  const mitigatedPoints = mitigatedCurve.map((val, i) => getCoordinates(val, i));

  const ambientPath = ambientPoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const ambientArea = `${ambientPath} L ${ambientPoints[23].x} ${paddingY + chartHeight} L ${ambientPoints[0].x} ${paddingY + chartHeight} Z`;

  const mitigatedPath = mitigatedPoints.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const activeAmbientPt = ambientPoints[selectedHour];
  const activeMitigatedPt = mitigatedPoints[selectedHour];

  return (
    <div className="bento-card rounded-2xl p-6 space-y-6">
      {/* Header and City Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Diurnal Smog Cycle & Exposure Suppression
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            24-hour diurnal atmospheric boundary-layer model vs. Purify physical intervention
          </p>
        </div>

        {/* City Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {Object.entries(CITY_DIURNAL_DATA).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setSelectedCity(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCity === key
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {data.name}
            </button>
          ))}
        </div>
      </div>

      {/* Narrative Alert */}
      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white font-semibold">{city.name} Inversion Profile:</strong> {city.narrative}
        </p>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-xl border border-slate-800/80 p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="ambientGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="mitigatedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + chartHeight * (1 - pct);
            const valLabel = Math.round(maxVal * pct);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={paddingX + chartWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* Ambient Fill Area */}
          <path d={ambientArea} fill="url(#ambientGradient)" />

          {/* Ambient Curve Line */}
          <path
            d={ambientPath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Mitigated Curve Line */}
          <path
            d={mitigatedPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Active Hour Vertical Indicator */}
          <line
            x1={activeAmbientPt.x}
            y1={paddingY}
            x2={activeAmbientPt.x}
            y2={paddingY + chartHeight}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Ambient Point */}
          <circle
            cx={activeAmbientPt.x}
            cy={activeAmbientPt.y}
            r="5"
            fill="#f43f5e"
            stroke="#020617"
            strokeWidth="2"
          />

          {/* Mitigated Point */}
          <circle
            cx={activeMitigatedPt.x}
            cy={activeMitigatedPt.y}
            r="5"
            fill="#10b981"
            stroke="#020617"
            strokeWidth="2"
          />

          {/* X Axis Time Labels */}
          {[0, 4, 8, 12, 16, 20, 23].map((hr) => {
            const x = paddingX + (hr / 23) * chartWidth;
            return (
              <text
                key={hr}
                x={x}
                y={paddingY + chartHeight + 18}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
              >
                {`${hr.toString().padStart(2, "0")}:00`}
              </text>
            );
          })}
        </svg>

        {/* Hour Slider Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Scrub Time of Day:</span>
            <input
              type="range"
              min="0"
              max="23"
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="w-36 sm:w-48 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
              {hourString}
            </span>
          </div>

          {/* Legend and Active Snapshot */}
          <div className="flex items-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-400">Ambient:</span>
              <span className="text-rose-400 font-bold">{ambientVal} µg/m³</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-400">With Purify:</span>
              <span className="text-emerald-400 font-bold">{mitigatedVal} µg/m³</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
