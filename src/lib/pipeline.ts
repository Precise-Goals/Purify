/**
 * End-to-End Execution Pipeline
 * Sequences: 1 Air Quality -> 2 Build Prompt -> 3 Gemini AI -> 4 Validate Catalog -> 5 Impact Model.
 * Captures detailed stage trace telemetry.
 */

import { fetchAirQuality, type AirQualityData, type FetchLike } from "./aqi";
import { validateActionIds, type CatalogAction } from "./catalog";
import { callGemini, GeminiError } from "./gemini";
import { calculateImpact, type ImpactResult } from "./impact";
import type { SanitizedProfile } from "./sanitize";

export interface PipelineTrace {
  stages: {
    aqiMs: number;
    geminiMs: number;
    validateMs: number;
    impactMs: number;
  };
  totalMs: number;
  gcpStack?: {
    runtime: string;
    model: string;
    aqiSource: string;
  };
}

export interface PlanResponse {
  air: AirQualityData;
  plan: {
    summary: string;
    actions: CatalogAction[];
    droppedActionIds: string[];
    dailyRoutineTips: string[];
    language?: string;
  };
  impact: ImpactResult;
  trace: PipelineTrace;
}

export interface RunPipelineOptions {
  apiKey: string;
  googleApiKey?: string;
  fetchFn?: FetchLike;
}

/**
 * Runs the complete BreatheWise pipeline for a sanitized household profile.
 */
export async function runPipeline(
  profile: SanitizedProfile,
  options: RunPipelineOptions
): Promise<PlanResponse> {
  const startTime = Date.now();
  const fetchFn = options.fetchFn || fetch;

  // Stage 1: Fetch Live Air Quality
  const aqiStart = Date.now();
  const air = await fetchAirQuality(
    {
      city: profile.city,
      latitude: profile.latitude,
      longitude: profile.longitude,
    },
    {
      googleApiKey: options.googleApiKey,
      fetchFn,
    }
  );
  const aqiMs = Date.now() - aqiStart;

  // Stage 2 & 3: Gemini Prompt & Generation
  const geminiStart = Date.now();
  const geminiOutput = await callGemini(profile, air, {
    apiKey: options.apiKey,
    fetchFn,
  });
  const geminiMs = Date.now() - geminiStart;

  // Stage 4: Catalog Action Validation
  const validateStart = Date.now();
  const validation = validateActionIds(geminiOutput.actionIds);

  if (validation.isEmpty) {
    throw new GeminiError(
      "MODEL_EMPTY",
      "Model suggested zero valid interventions matching our curated smog catalog."
    );
  }
  const validateMs = Date.now() - validateStart;

  // Stage 5: Deterministic Impact Model
  const impactStart = Date.now();
  const impact = calculateImpact(
    {
      outdoorHours: profile.outdoorHours,
      outdoorPM25: air.pm25,
      hasExistingPurifier: profile.hasExistingPurifier,
      homeType: profile.homeType,
    },
    validation.validActions
  );
  const impactMs = Date.now() - impactStart;

  const totalMs = Date.now() - startTime;

  return {
    air,
    plan: {
      summary: geminiOutput.summary,
      actions: validation.validActions,
      droppedActionIds: validation.droppedIds,
      dailyRoutineTips: geminiOutput.dailyRoutineTips,
      language: geminiOutput.language,
    },
    impact,
    trace: {
      stages: {
        aqiMs,
        geminiMs,
        validateMs,
        impactMs,
      },
      totalMs,
      gcpStack: {
        runtime: "Google Cloud Run / Edge Serverless",
        model: "Gemini 2.5 Flash via Google AI / Vertex API",
        aqiSource: air.source === "google" ? "Google Maps Air Quality API" : "Open-Meteo High-Res AQI",
      },
    },
  };
}
