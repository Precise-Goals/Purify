import { NextResponse } from "next/server";
import { runPipeline, type PlanResponse, type RunPipelineOptions } from "@/lib/pipeline";
import {
  checkPayloadSize,
  redactSecrets,
  sanitizeProfile,
  validateGeminiKey,
  type SanitizedProfile,
} from "@/lib/sanitize";
import { globalRateLimiter, type RateLimiter } from "@/lib/rate-limiter";
import { GeminiError } from "@/lib/gemini";

export interface PlanRouteDependencies {
  rateLimiter?: RateLimiter;
  runPipelineFn?: (profile: SanitizedProfile, options: RunPipelineOptions) => Promise<PlanResponse>;
  googleApiKey?: string;
}

const GEMINI_STATUS_MAP: Record<string, number> = {
  NO_KEY: 401,
  BAD_KEY: 401,
  QUOTA: 429,
  MODEL_EMPTY: 422,
  MODEL_BLOCKED: 422,
  MODEL_BAD_JSON: 502,
  GEMINI_FAIL: 502,
};

const NO_STORE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

/**
 * Extracts normalized client IP address from reverse-proxy headers.
 */
function extractClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "127.0.0.1";
}

/**
 * Maps internal domain and network errors into safe, redacted HTTP JSON responses.
 */
function mapPlanErrorToResponse(err: unknown): NextResponse {
  if (err instanceof GeminiError) {
    const status = GEMINI_STATUS_MAP[err.code] || 500;
    return NextResponse.json(
      { error: err.code, message: redactSecrets(err.message) },
      { status, headers: NO_STORE_HEADERS }
    );
  }

  if (err instanceof Error && err.message.includes("AQI_UNAVAILABLE")) {
    return NextResponse.json(
      {
        error: "AQI_UNAVAILABLE",
        message: "Unable to retrieve air quality data from both Google and Open-Meteo providers.",
      },
      { status: 502, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred while generating the plan.",
    },
    { status: 500, headers: NO_STORE_HEADERS }
  );
}

/**
 * Handles POST /api/plan with rate limiting, header auth, size guards, and sanitization.
 */
export async function handlePlanRequest(
  request: Request,
  deps: PlanRouteDependencies = {}
): Promise<NextResponse> {
  const limiter = deps.rateLimiter ?? globalRateLimiter;
  const pipelineExecutor = deps.runPipelineFn ?? runPipeline;

  // 1. IP Rate Limiting
  const rateLimit = limiter.check(extractClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "Too many requests. Please wait before requesting another plan.",
        resetSeconds: rateLimit.resetSeconds,
      },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          "Retry-After": String(rateLimit.resetSeconds),
        },
      }
    );
  }

  // 2. Gemini Key Validation
  const apiKey = request.headers.get("x-gemini-key");
  const keyValidation = validateGeminiKey(apiKey);
  if (!keyValidation.valid) {
    return NextResponse.json(
      {
        error: keyValidation.code,
        message:
          keyValidation.code === "NO_KEY"
            ? "Gemini API key is required. Supply your key in the x-gemini-key header."
            : "The supplied Gemini API key is malformed.",
      },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }

  // 3. MIME Content-Type Guard (prevents simple CORS form-CSRF)
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      {
        error: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json.",
      },
      { status: 415, headers: NO_STORE_HEADERS }
    );
  }

  // 4. Body Size Validation (8 KB cap)
  let rawBodyText: string;
  try {
    rawBodyText = await request.text();
  } catch {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Failed to read request body" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const sizeCheck = checkPayloadSize(rawBodyText);
  if (!sizeCheck.valid) {
    return NextResponse.json(
      {
        error: "BODY_TOO_LARGE",
        message: "Payload exceeds 8 KB limit.",
        bytes: sizeCheck.bytes,
      },
      { status: 413, headers: NO_STORE_HEADERS }
    );
  }

  // 5. JSON & Profile Sanitization
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBodyText);
  } catch {
    return NextResponse.json(
      { error: "BAD_JSON", message: "Malformed JSON payload" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const { profile, error: sanitizeError } = sanitizeProfile(parsedJson);
  if (sanitizeError || !profile) {
    return NextResponse.json(
      { error: "VALIDATION_FAILED", message: sanitizeError },
      { status: 422, headers: NO_STORE_HEADERS }
    );
  }

  // 6. Execute Pipeline
  try {
    const googleApiKey = deps.googleApiKey ?? process.env.GOOGLE_AIR_QUALITY_KEY;
    const result = await pipelineExecutor(profile, {
      apiKey: apiKey!.trim(),
      googleApiKey,
    });
    return NextResponse.json(result, { status: 200, headers: NO_STORE_HEADERS });
  } catch (err: unknown) {
    return mapPlanErrorToResponse(err);
  }
}
