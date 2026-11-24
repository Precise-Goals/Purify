import React from "react";
import type { AirQualityData, AQICategory } from "../lib/aqi";

export function getAqiColorClass(category: AQICategory): string {
  switch (category) {
    case "Good":
      return "bg-emerald-50 text-emerald-700 border-emerald-300";
    case "Moderate":
      return "bg-yellow-50 text-yellow-800 border-yellow-300";
    case "UnhealthyForSensitiveGroups":
      return "bg-amber-50 text-amber-800 border-amber-300";
    case "Unhealthy":
      return "bg-orange-50 text-orange-800 border-orange-400";
    case "VeryUnhealthy":
      return "bg-purple-50 text-purple-800 border-purple-400";
    case "Hazardous":
    default:
      return "bg-rose-50 text-rose-800 border-rose-500";
  }
}

interface AqiBadgeProps {
  air: AirQualityData;
}

export const AqiBadge: React.FC<AqiBadgeProps> = ({ air }) => {
  const colorClass = getAqiColorClass(air.category);

  return (
    <div className="w-full space-y-3">
      {air.isSevereHazard && (
        <div className="p-4 rounded-xl bg-rose-600 text-white font-semibold text-sm border-2 border-rose-700 shadow-md flex items-start gap-3 animate-pulse">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-bold text-base uppercase tracking-wider">
              Severe Hazardous Smog Warning (AQI {air.aqi})
            </div>
            <p className="mt-1 text-rose-100 font-normal">
              {air.medicalEscalation ||
                "AQI is dangerously high. Vulnerable individuals (children, seniors, asthmatics) should stay indoors in filtered spaces and seek medical care if experiencing respiratory distress."}
            </p>
          </div>
        </div>
      )}

      <div
        className={`p-5 rounded-2xl border-2 shadow-sm flex flex-wrap items-center justify-between gap-4 ${colorClass}`}
      >
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold opacity-80">
            Live Ambient Air Quality · {air.location.displayName}
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-5xl font-black">{air.aqi}</span>
            <span className="text-xl font-bold">AQI ({air.category})</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold">
            PM2.5: <span className="font-bold text-lg">{air.pm25}</span> µg/m³
          </div>
          <div className="text-xs opacity-75 mt-0.5">
            Source: {air.source === "google" ? "Google Air Quality API" : "Open-Meteo Fallback"}
          </div>
        </div>
      </div>
    </div>
  );
};
