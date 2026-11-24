/**
 * Gemini AI Integration
 * Plain fetch client using structured JSON generation, untrusted prompt wrapping,
 * fence stripping, 429 quota handling without retry storm, and 5xx single-retry.
 */

import { ACTION_CATALOG } from "./catalog";
import type { AirQualityData, FetchLike } from "./aqi";
import type { SanitizedProfile } from "./sanitize";

export interface GeminiPlanOutput {
  summary: string;
  actionIds: string[];
  dailyRoutineTips: string[];
  language?: "en" | "hi" | "mr";
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

export class GeminiError extends Error {
  constructor(public readonly code: GeminiErrorCode, message: string) {
    super(`[${code}] ${message}`);
    this.name = "GeminiError";
  }
}

/**
 * Strips markdown code fences (```json ... ``` or ``` ... ```) from model output.
 */
export function stripMarkdownFences(raw: string): string {
  let cleaned = raw.trim();
  // Strip ```json or ``` at beginning
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  // Strip ``` at end
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
  } catch (err: any) {
    throw new GeminiError(
      "MODEL_BAD_JSON",
      `Model returned invalid JSON format: ${err?.message || "parse error"}`
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new GeminiError("MODEL_BAD_JSON", "Parsed output is not a JSON object");
  }

  const obj = parsed as Record<string, unknown>;

  const summary = typeof obj.summary === "string" ? obj.summary : "Personalized Smog Protection Routine";
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
    language: (obj.language as any) || "en",
  };
}

/**
 * Builds system instruction and user prompt with untrusted data isolation.
 */
export function buildGeminiPrompt(
  profile: SanitizedProfile,
  aqiData: AirQualityData
): { systemInstruction: string; userPrompt: string } {
  const allowedIds = ACTION_CATALOG.map((a) => `${a.id} (${a.title}, scope: ${a.scope}, eff: ${a.efficiency})`).join("\n- ");

  const systemInstruction = `You are BreatheWise, an empathetic, evidence-based winter smog assistant for South and East Asia.
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
 * Calls Gemini Generative Language API via standard fetch with retry on 5xx and quota handling.
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

  const candidateModels = options.model
    ? [options.model]
    : ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"];
  const fetchFn = options.fetchFn || fetch;
  const timeoutMs = options.timeoutMs || 30000;

  const { systemInstruction, userPrompt } = buildGeminiPrompt(profile, aqiData);

  const requestBody = {
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

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    let attempts = 0;
    while (attempts < 2) {
      attempts++;
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

        lastResponse = response;

        // Handle 429 Quota without retry storm
        if (response.status === 429) {
          throw new GeminiError(
            "QUOTA",
            "Gemini API quota exceeded (HTTP 429). Please verify your Google AI Studio plan or retry later."
          );
        }

        // If model not found (404), fall through to next candidate model
        if (response.status === 404 && candidateModels.length > 1) {
          break;
        }

        // If server error (500, 502, 503, 504), retry once
        if (response.status >= 500 && attempts < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 400 || response.status === 403) {
            throw new GeminiError("BAD_KEY", `Google API rejected key: ${response.status} ${errorText}`);
          }
          throw new GeminiError("GEMINI_FAIL", `Gemini returned HTTP ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as any;
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

        return parseGeminiResponse(text);
      } catch (err: any) {
        if (err instanceof GeminiError) {
          throw err;
        }
        lastError = err;
        if (attempts < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }

  // Retried and still failed
  throw new GeminiError(
    "GEMINI_FAIL",
    `Failed to communicate with Gemini after retry: ${lastError?.message || lastResponse?.status || "unknown error"}`
  );
}
