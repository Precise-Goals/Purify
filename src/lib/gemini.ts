/**
 * Gemini AI Integration
 * Plain fetch client using structured JSON generation, untrusted prompt wrapping,
 * fence stripping, 429 quota handling without retry storm, and 5xx single-retry.
 */

import { ACTION_CATALOG } from "./catalog";
import type { AirQualityData, FetchLike } from "./aqi";
import { redactSecrets, type SanitizedProfile } from "./sanitize";

export type SupportedLanguage = "en" | "hi" | "mr";

export interface GeminiPlanOutput {
  summary: string;
  actionIds: string[];
  dailyRoutineTips: string[];
  language?: SupportedLanguage;
}

export interface CallGeminiOptions {
  apiKey: string;
  model?: string;
  fetchFn?: FetchLike;
  timeoutMs?: number;
}

export type GeminiErrorCode =
  | "NO_KEY"
  | "BAD_KEY"
  | "QUOTA"
  | "GEMINI_FAIL"
  | "MODEL_BLOCKED"
  | "MODEL_BAD_JSON"
  | "MODEL_EMPTY";

interface GeminiApiCandidate {
  finishReason?: string;
  content?: {
    parts?: Array<{ text?: unknown }>;
  };
}

interface GeminiApiResponse {
  candidates?: GeminiApiCandidate[];
}

const DEFAULT_CANDIDATE_MODELS: readonly string[] = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];

/**
 * Typed error representing failures during Gemini inference.
 */
export class GeminiError extends Error {
  constructor(public readonly code: GeminiErrorCode, message: string) {
    super(`[${code}] ${redactSecrets(message)}`);
    this.name = "GeminiError";
  }
}

/**
 * Narrows arbitrary parsed language values into supported union values.
 */
function parseLanguage(value: unknown): SupportedLanguage {
  if (value === "hi" || value === "mr" || value === "en") {
    return value;
  }
  return "en";
}

/**
 * Strips markdown code fences (```json ... ``` or ``` ... ```) from model output.
 */
export function stripMarkdownFences(raw: string): string {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/, "");
  return cleaned.trim();
}

/**
 * Parses and coerces Gemini raw text output into GeminiPlanOutput.
 */
export function parseGeminiResponse(rawText: string): GeminiPlanOutput {
  const stripped = stripMarkdownFences(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "parse error";
    throw new GeminiError("MODEL_BAD_JSON", `Model returned invalid JSON format: ${detail}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new GeminiError("MODEL_BAD_JSON", "Parsed output is not a JSON object");
  }

  const obj = parsed as Record<string, unknown>;

  const summary =
    typeof obj.summary === "string" ? obj.summary : "Personalized Smog Protection Routine";
  const actionIds = Array.isArray(obj.actionIds)
    ? obj.actionIds.filter((id): id is string => typeof id === "string")
    : [];
  const dailyRoutineTips = Array.isArray(obj.dailyRoutineTips)
    ? obj.dailyRoutineTips.filter((t): t is string => typeof t === "string")
    : [];

  return {
    summary,
    actionIds,
    dailyRoutineTips,
    language: parseLanguage(obj.language),
  };
}

/**
 * Builds system instruction and user prompt with untrusted data isolation.
 */
export function buildGeminiPrompt(
  profile: SanitizedProfile,
  aqiData: AirQualityData
): { systemInstruction: string; userPrompt: string } {
  const allowedIds = ACTION_CATALOG.map(
    (a) => `${a.id} (${a.title}, scope: ${a.scope}, eff: ${a.efficiency})`
  ).join("\n- ");

  const systemInstruction = `You are Purify (formerly BreatheWise), an empathetic, evidence-based winter smog assistant for South and East Asia.
Your mission is to suggest practical, affordable routines to protect families from severe airborne particulates (PM2.5).

CRITICAL CONSTRAINTS:
1. You MUST pick action IDs ONLY from the following allowed catalog. Do NOT invent new action IDs:
- ${allowedIds}

2. Return valid JSON only adhering strictly to this schema:
{
  "summary": "1-2 sentence empathetic summary tailored to the household and city",
  "actionIds": ["string array of chosen catalog IDs matching the profile and budget"],
  "dailyRoutineTips": ["3-4 actionable daily hacks: ventilation window, commute advice, nighttime routine"],
  "language": "en" | "hi" | "mr"
}
`;

  const userHouseholdJson = JSON.stringify({
    city: profile.city,
    homeType: profile.homeType,
    cookingFuel: profile.cookingFuel,
    commuteMode: profile.commuteMode,
    budget: profile.budget,
    outdoorHours: profile.outdoorHours,
    hasExistingPurifier: profile.hasExistingPurifier,
    notes: profile.notes,
  });

  const userPrompt = `Live Air Quality Conditions:
- Location: ${aqiData.location.displayName}
- Current AQI: ${aqiData.aqi} (${aqiData.category})
- Ambient PM2.5: ${aqiData.pm25} µg/m³
${aqiData.isSevereHazard ? "- SEVERE HAZARD WARNING: AQI is dangerously elevated." : ""}

User Household Profile:
<household untrusted="true">
${userHouseholdJson}
</household>

Analyze this household and live smog level. Select the most effective, affordable catalog action IDs and formulate practical daily advice.`;

  return { systemInstruction, userPrompt };
}

/**
 * Validates candidate structure and extracts raw JSON response text.
 */
function extractCandidateText(data: GeminiApiResponse): string {
  const candidate = data.candidates?.[0];
  if (!candidate || candidate.finishReason === "SAFETY") {
    throw new GeminiError(
      "MODEL_BLOCKED",
      "Gemini safety filters or policy blocked the response. Please refine your household notes."
    );
  }

  const text = candidate.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new GeminiError("MODEL_BLOCKED", "Model returned empty content");
  }

  return text;
}

/**
 * Invokes a single Gemini model endpoint with header authentication and single 5xx retry.
 * Returns null only when a fallback model should be attempted due to 404.
 */
async function invokeGeminiModel(
  model: string,
  apiKey: string,
  requestBody: Record<string, unknown>,
  allowModelFallback: boolean,
  fetchFn: FetchLike,
  timeoutMs: number
): Promise<GeminiPlanOutput | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  let lastError: Error | null = null;
  let lastStatus: number | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetchFn(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(timeoutMs),
      });

      lastStatus = response.status;

      if (response.status === 429) {
        throw new GeminiError(
          "QUOTA",
          "Gemini API quota exceeded (HTTP 429). Please verify your Google AI Studio plan or retry later."
        );
      }

      if (response.status === 404 && allowModelFallback) {
        return null;
      }

      if (response.status >= 500 && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      if (!response.ok) {
        const errorText = redactSecrets(await response.text());
        if (response.status === 400 || response.status === 403) {
          throw new GeminiError("BAD_KEY", `Google API rejected key: ${response.status} ${errorText}`);
        }
        throw new GeminiError("GEMINI_FAIL", `Gemini returned HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as GeminiApiResponse;
      return parseGeminiResponse(extractCandidateText(data));
    } catch (err: unknown) {
      if (err instanceof GeminiError) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw new GeminiError(
    "GEMINI_FAIL",
    `Failed to communicate with Gemini after retry: ${lastError?.message || lastStatus || "unknown error"}`
  );
}

/**
 * Calls Gemini Generative Language API via plain fetch with model fallback chain,
 * single retry on 5xx, and strict 429 quota protection.
 */
export async function callGemini(
  profile: SanitizedProfile,
  aqiData: AirQualityData,
  options: CallGeminiOptions
): Promise<GeminiPlanOutput> {
  const apiKey = (options.apiKey || "").trim();
  if (!apiKey) {
    throw new GeminiError("NO_KEY", "Gemini API key is missing");
  }

  const candidateModels = options.model ? [options.model] : DEFAULT_CANDIDATE_MODELS;
  const fetchFn = options.fetchFn || fetch;
  const timeoutMs = options.timeoutMs || 30000;

  const { systemInstruction, userPrompt } = buildGeminiPrompt(profile, aqiData);

  const requestBody: Record<string, unknown> = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  for (let idx = 0; idx < candidateModels.length; idx++) {
    const canFallback = idx < candidateModels.length - 1;
    const plan = await invokeGeminiModel(
      candidateModels[idx],
      apiKey,
      requestBody,
      canFallback,
      fetchFn,
      timeoutMs
    );
    if (plan) {
      return plan;
    }
  }

  throw new GeminiError("GEMINI_FAIL", "All candidate Gemini models failed to respond.");
}
