import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";
import {
  checkPayloadSize,
  sanitizeProfile,
  validateGeminiKey,
} from "@/lib/sanitize";
import { globalRateLimiter } from "@/lib/rate-limiter";
import { GeminiError } from "@/lib/gemini";

export async function POST(request: Request) {
  // 1. IP Rate Limiting (8 req/min sliding window)
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateLimit = globalRateLimiter.check(clientIp);
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
      { status: 401 }
    );
  }

  // 3. Body Size Validation (8 KB cap)
  let rawBodyText: string;
  try {
    rawBodyText = await request.text();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Failed to read request body" }, { status: 400 });
  }

  const sizeCheck = checkPayloadSize(rawBodyText);
  if (!sizeCheck.valid) {
    return NextResponse.json(
      {
        error: "BODY_TOO_LARGE",
        message: "Payload exceeds 8 KB limit.",
        bytes: sizeCheck.bytes,
      },
      { status: 413 }
    );
  }

  // 4. JSON & Profile Sanitization
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBodyText);
  } catch {
    return NextResponse.json({ error: "BAD_JSON", message: "Malformed JSON payload" }, { status: 400 });
  }

  const { profile, error: sanitizeError } = sanitizeProfile(parsedJson);
  if (sanitizeError || !profile) {
    return NextResponse.json({ error: "VALIDATION_FAILED", message: sanitizeError }, { status: 422 });
  }

  // 5. Run Live Pipeline
  try {
    const googleApiKey = process.env.GOOGLE_AIR_QUALITY_KEY;
    const result = await runPipeline(profile, {
      apiKey: apiKey!.trim(),
      googleApiKey,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    if (err instanceof GeminiError) {
      const statusMap: Record<string, number> = {
        NO_KEY: 401,
        BAD_KEY: 401,
        QUOTA: 429,
        MODEL_EMPTY: 422,
        MODEL_BLOCKED: 422,
        MODEL_BAD_JSON: 502,
        GEMINI_FAIL: 502,
      };
      const status = statusMap[err.code] || 500;
      return NextResponse.json(
        {
          error: err.code,
          message: err.message,
        },
        { status }
      );
    }

    if (err?.message?.includes("AQI_UNAVAILABLE")) {
      return NextResponse.json(
        {
          error: "AQI_UNAVAILABLE",
          message: "Unable to retrieve air quality data from both Google and Open-Meteo providers.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred while generating the plan.",
      },
      { status: 500 }
    );
  }
}
