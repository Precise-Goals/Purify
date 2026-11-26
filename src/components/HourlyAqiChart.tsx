"use client";

import React, { useState } from "react";
import { Activity, Clock, Info } from "lucide-react";

interface CityData {
  name: string;
  country: string;
  baselinePeak: number;
  curve: number[];
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
    narrative:
      "Severe winter inversion traps vehicular exhaust and biomass emissions beneath a low planetary boundary layer during early morning and late night.",
  },
  lahore: {
    name: "Lahore",
    country: "Pakistan",
    baselinePeak: 420,
    curve: [
      290, 310, 330, 360, 395, 420, 380, 310, 230, 175, 150, 140,
      135, 145, 165, 205, 260, 320, 370, 390, 405, 380, 330, 305,
    ],
    narrative:
      "Stagnant anticyclonic conditions create toxic episodic smog spikes with PM2.5 concentrations reaching hazardous thresholds exceeding 400 µg/m³.",
  },
  beijing: {
    name: "Beijing",
    country: "China",
    baselinePeak: 195,
    curve: [
      110, 120, 135, 150, 175, 195, 180, 145, 105, 80, 65, 60,
      55, 60, 70, 90, 120, 150, 170, 185, 175, 150, 130, 115,
    ],
    narrative:
      "Mountain basin topography traps north-moving industrial plumes until strong cold-front winds flush the atmospheric basin.",
  },
  london: {
    name: "London",
    country: "UK",
    baselinePeak: 45,
    curve: [
      18, 16, 15, 18, 26, 42, 45, 38, 28, 22, 20, 19,
      18, 20, 24, 32, 41, 44, 36, 28, 25, 22, 20, 19,
    ],
    narrative:
      "Mild modern background with localized peaks during rush hour traffic along arterial corridors.",
  },
};

export const HourlyAqiChart: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>("delhi");
  const [selectedHour, setSelectedHour] = useState<number>(8);

  const city = CITY_DIURNAL_DATA[selectedCity] || CITY_DIURNAL_DATA.delhi;
  const maxVal = Math.max(...city.curve) * 1.15;

  const mitigatedCurve = city.curve.map((val) => Math.round(val * 0.18));
  const ambientVal = city.curve[selectedHour];
  const mitigatedVal = mitigatedCurve[selectedHour];
  const hourString = `${selectedHour.toString().padStart(2, "0")}:00`;

  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-zinc-950" aria-hidden="true" />
            <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
              Diurnal Smog Cycle & Exposure Suppression
            </h3>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            24-hour diurnal atmospheric boundary-layer model vs. Purify physical intervention
          </p>
        </div>

        {/* Accessible City Tabs */}
        <div
          role="tablist"
          aria-label="City smog simulation profile"
          className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80"
        >
          {Object.entries(CITY_DIURNAL_DATA).map(([key, data]) => {
            const isSelected = selectedCity === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCity(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${
                  isSelected
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-700 hover:text-zinc-950 hover:bg-white"
                }`}
              >
                {data.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Narrative Alert */}
      <div className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-200 text-xs text-zinc-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-zinc-950 font-semibold">{city.name} Inversion Profile:</strong>{" "}
          {city.narrative}
        </p>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden bg-white/75 rounded-xl border border-zinc-200/80 p-2 sm:p-4">
        <svg
          role="img"
          aria-label={`24-hour PM2.5 smog comparison chart for ${city.name}. At ${hourString}, ambient PM2.5 is ${ambientVal} micrograms per cubic meter and Purify mitigated level is ${mitigatedVal}.`}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="ambientGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="mitigatedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
          </defs>

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
                  stroke="#E4E4E7"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#52525B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          <path d={ambientArea} fill="url(#ambientGradient)" />
          <path d={ambientPath} fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
          <path d={mitigatedPath} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />

          <line
            x1={activeAmbientPt.x}
            y1={paddingY}
            x2={activeAmbientPt.x}
            y2={paddingY + chartHeight}
            stroke="#52525B"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          <circle cx={activeAmbientPt.x} cy={activeAmbientPt.y} r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx={activeMitigatedPt.x} cy={activeMitigatedPt.y} r="5" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />

          {[0, 4, 8, 12, 16, 20, 23].map((hr) => {
            const x = paddingX + (hr / 23) * chartWidth;
            return (
              <text
                key={hr}
                x={x}
                y={paddingY + chartHeight + 18}
                textAnchor="middle"
                fill="#52525B"
                fontSize="10"
                fontFamily="monospace"
              >
                {`${hr.toString().padStart(2, "0")}:00`}
              </text>
            );
          })}
        </svg>

        {/* Accessible Hour Slider Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-200/80">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-zinc-950" aria-hidden="true" />
            <label htmlFor="smog-hour-slider" className="text-xs text-zinc-700 font-medium">
              Scrub Time of Day:
            </label>
            <input
              id="smog-hour-slider"
              type="range"
              min={0}
              max={23}
              value={selectedHour}
              aria-valuetext={`${hourString}, Ambient ${ambientVal} µg/m³, With Purify ${mitigatedVal} µg/m³`}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="w-36 sm:w-48 accent-zinc-950 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
            />
            <span className="font-mono text-xs font-bold text-zinc-950 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200">
              {hourString}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" aria-hidden="true" />
              <span className="text-zinc-700">Ambient:</span>
              <span className="text-rose-700 font-bold">{ambientVal} µg/m³</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
              <span className="text-zinc-700">With Purify:</span>
              <span className="text-emerald-800 font-bold">{mitigatedVal} µg/m³</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
