import React from "react";
import type { AirQualityData, AQICategory } from "../lib/aqi";
import { MapPin, CloudFog, ShieldAlert } from "lucide-react";

/**
 * Returns WCAG-compliant AQI category surface and border styles.
 */
export function getAqiColorClass(category: AQICategory): string {
  switch (category) {
    case "Good":
      return "bg-emerald-50 text-emerald-950 border-emerald-200/90";
    case "Moderate":
      return "bg-yellow-50 text-yellow-950 border-yellow-200/90";
    case "UnhealthyForSensitiveGroups":
      return "bg-amber-50 text-amber-950 border-amber-200/90";
    case "Unhealthy":
      return "bg-orange-50 text-orange-950 border-orange-200/90";
    case "VeryUnhealthy":
      return "bg-purple-50 text-purple-950 border-purple-200/90";
    case "Hazardous":
    default:
      return "bg-rose-50 text-rose-950 border-rose-200/90";
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
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-sm shadow-sm flex items-start gap-3"
        >
          <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5 animate-pulse" aria-hidden="true" />
          <div className="space-y-1">
            <div className="font-bold text-sm uppercase tracking-wider text-rose-900 flex items-center gap-2">
              <span>Severe Hazardous Smog Warning</span>
              <span className="text-xs px-2 py-0.5 bg-rose-700 text-white rounded font-mono font-bold">
                AQI {air.aqi}
              </span>
            </div>
            <p className="text-rose-900 text-xs leading-relaxed font-normal">
              {air.medicalEscalation ||
                "AQI is dangerously high. Vulnerable individuals (children, seniors, asthmatics) should stay indoors in filtered spaces and seek medical care if experiencing respiratory distress."}
            </p>
          </div>
        </div>
      )}

      <div
        role="region"
        aria-label={`Live air quality for ${air.location.displayName}`}
        className={`p-6 rounded-2xl border backdrop-blur-md shadow-sm flex flex-wrap items-center justify-between gap-6 ${colorClass}`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{air.location.displayName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] opacity-90">
              [{air.location.latitude.toFixed(2)}, {air.location.longitude.toFixed(2)}]
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black tracking-tight">{air.aqi}</span>
            <div>
              <span className="text-lg font-bold block leading-none">AQI</span>
              <span className="text-xs font-semibold">{air.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold flex items-center justify-end gap-1.5">
              <CloudFog className="w-3.5 h-3.5" aria-hidden="true" />
              <span>PM2.5 Ambient</span>
            </div>
            <div className="text-2xl font-black font-mono">
              {air.pm25} <span className="text-xs font-normal">µg/m³</span>
            </div>
            <div className="text-[11px] font-mono">
              Source: {air.source === "google" ? "Google Maps Air Quality API" : "Open-Meteo Sensor Array"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
