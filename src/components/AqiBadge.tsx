import React from "react";
import type { AirQualityData, AQICategory } from "../lib/aqi";
import { AlertTriangle, MapPin, Activity, Gauge, CloudFog, ShieldAlert } from "lucide-react";

export function getAqiColorClass(category: AQICategory): string {
  switch (category) {
    case "Good":
      return "bg-emerald-950/40 text-emerald-300 border-emerald-500/40";
    case "Moderate":
      return "bg-yellow-950/40 text-yellow-300 border-yellow-500/40";
    case "UnhealthyForSensitiveGroups":
      return "bg-amber-950/40 text-amber-300 border-amber-500/40";
    case "Unhealthy":
      return "bg-orange-950/40 text-orange-300 border-orange-500/40";
    case "VeryUnhealthy":
      return "bg-purple-950/40 text-purple-300 border-purple-500/40";
    case "Hazardous":
    default:
      return "bg-rose-950/40 text-rose-300 border-rose-500/40";
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
        <div className="p-4 rounded-2xl bg-rose-950/80 text-rose-100 text-sm border-2 border-rose-600 shadow-lg shadow-rose-950/50 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <div className="font-bold text-sm uppercase tracking-wider text-rose-200 flex items-center gap-2">
              <span>Severe Hazardous Smog Warning</span>
              <span className="text-xs px-2 py-0.5 bg-rose-600 text-white rounded font-mono">
                AQI {air.aqi}
              </span>
            </div>
            <p className="text-rose-200/90 text-xs leading-relaxed font-normal">
              {air.medicalEscalation ||
                "AQI is dangerously high. Vulnerable individuals (children, seniors, asthmatics) should stay indoors in filtered spaces and seek medical care if experiencing respiratory distress."}
            </p>
          </div>
        </div>
      )}

      <div
        className={`p-6 rounded-2xl border backdrop-blur-md shadow-md flex flex-wrap items-center justify-between gap-6 ${colorClass}`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold opacity-90">
            <MapPin className="w-3.5 h-3.5" />
            <span>{air.location.displayName}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-[11px] opacity-75">
              [{air.location.latitude.toFixed(2)}, {air.location.longitude.toFixed(2)}]
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black tracking-tight">{air.aqi}</span>
            <div>
              <span className="text-lg font-bold block leading-none">AQI</span>
              <span className="text-xs opacity-80 font-medium">{air.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80 flex items-center justify-end gap-1.5">
              <CloudFog className="w-3.5 h-3.5" />
              <span>PM2.5 Ambient</span>
            </div>
            <div className="text-2xl font-black font-mono">
              {air.pm25} <span className="text-xs font-normal opacity-75">µg/m³</span>
            </div>
            <div className="text-[11px] opacity-70 font-mono">
              Source: {air.source === "google" ? "Google Maps Air Quality API" : "Open-Meteo Sensor Array"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
