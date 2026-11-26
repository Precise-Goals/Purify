import { describe, expect, it } from "bun:test";
import {
  buildGeminiPrompt,
  callGemini,
  parseGeminiResponse,
  stripMarkdownFences,
  GeminiError,
} from "../src/lib/gemini";
import type { AirQualityData, FetchLike } from "../src/lib/aqi";
import type { SanitizedProfile } from "../src/lib/sanitize";

const dummyProfile: SanitizedProfile = {
  city: "Delhi",
  homeType: "standard",
  cookingFuel: "lpg_electric",
  commuteMode: "carpool_transit",
  budget: "low",
  outdoorHours: 2,
  hasExistingPurifier: false,
  notes: "Toddler at home with cough",
};

const dummyAQI: AirQualityData = {
  aqi: 280,
  pm25: 195.0,
  category: "VeryUnhealthy",
  source: "open-meteo",
  location: { latitude: 28.61, longitude: 77.2, displayName: "Delhi, India" },
  isSevereHazard: false,
  fetchedAt: "2026-11-24T05:00:00Z",
};

describe("gemini: buildGeminiPrompt", () => {
  it("encloses user household profile inside untrusted block", () => {
    const { userPrompt } = buildGeminiPrompt(dummyProfile, dummyAQI);
    expect(userPrompt).toContain('<household untrusted="true">');
    expect(userPrompt).toContain("Toddler at home with cough");
    expect(userPrompt).toContain("280");
  });
});

describe("gemini: stripMarkdownFences & parseGeminiResponse", () => {
  it("strips ```json code fences and parses plan", () => {
    const fenced =
      '```json\n{\n  "summary": "Custom smog plan",\n  "actionIds": ["n95_mask_commute", "wet_mopping_daily"],\n  "dailyRoutineTips": ["Stay indoors"],\n  "language": "hi"\n}\n```';
    expect(stripMarkdownFences(fenced)).not.toContain("```");

    const parsed = parseGeminiResponse(fenced);
    expect(parsed.summary).toBe("Custom smog plan");
    expect(parsed.actionIds).toEqual(["n95_mask_commute", "wet_mopping_daily"]);
    expect(parsed.language).toBe("hi");
  });

  it("coerces missing fields safely when JSON object omits optional properties", () => {
    const parsed = parseGeminiResponse("{}");
    expect(parsed.summary).toBe("Personalized Smog Protection Routine");
    expect(parsed.actionIds).toEqual([]);
    expect(parsed.dailyRoutineTips).toEqual([]);
    expect(parsed.language).toBe("en");
  });

  it("throws MODEL_BAD_JSON if response is completely invalid JSON or non-object", () => {
    expect(() => parseGeminiResponse("Sorry, I cannot help with this.")).toThrow(
      /MODEL_BAD_JSON/
    );
    expect(() => parseGeminiResponse("[]")).toThrow(/MODEL_BAD_JSON/);
  });
});

describe("gemini: callGemini resilience (AC-003-a, AC-003-b, AC-007-b)", () => {
  it("throws NO_KEY immediately when apiKey is empty", async () => {
    await expect(callGemini(dummyProfile, dummyAQI, { apiKey: "   " })).rejects.toThrow(/NO_KEY/);
  });

  it("successfully returns structured plan on HTTP 200 (AC-003-a)", async () => {
    const mockFetch: FetchLike = async (_url, init) => {
      const headers = init?.headers as Record<string, string> | undefined;
      expect(headers?.["x-goog-api-key"]).toBe("AIzaSyD-validKeyForTesting123456");
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      summary: "Protect your toddler during Delhi winter smog.",
                      actionIds: ["n95_mask_commute", "diy_box_fan_filter"],
                      dailyRoutineTips: ["Ventilate only during midday."],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200 }
      );
    };

    const res = await callGemini(dummyProfile, dummyAQI, {
      apiKey: "AIzaSyD-validKeyForTesting123456",
      fetchFn: mockFetch,
    });

    expect(res.summary).toContain("Protect your toddler");
    expect(res.actionIds).toContain("n95_mask_commute");
  });

  it("falls through to subsequent candidate model when primary model returns 404", async () => {
    const seenUrls: string[] = [];
    const mockFetch: FetchLike = async (url) => {
      const urlStr = url.toString();
      seenUrls.push(urlStr);
      if (urlStr.includes("gemini-3.5-flash-lite")) {
        return new Response("Model retired", { status: 404 });
      }
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      summary: "Fallback model response.",
                      actionIds: ["n95_mask_commute"],
                      dailyRoutineTips: ["Use sealed windows."],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200 }
      );
    };

    const res = await callGemini(dummyProfile, dummyAQI, {
      apiKey: "AIzaSyD-validKeyForTesting123456",
      fetchFn: mockFetch,
    });

    expect(seenUrls.length).toBe(2);
    expect(res.summary).toBe("Fallback model response.");
  });

  it("handles HTTP 429 quota without retry storm and throws QUOTA (AC-007-b)", async () => {
    let attempts = 0;
    const mockFetch: FetchLike = async () => {
      attempts++;
      return new Response(JSON.stringify({ error: { message: "Quota exceeded" } }), {
        status: 429,
      });
    };

    try {
      await callGemini(dummyProfile, dummyAQI, {
        apiKey: "AIzaSyD-validKeyForTesting123456",
        fetchFn: mockFetch,
      });
      expect(true).toBe(false);
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(GeminiError);
      expect((err as GeminiError).code).toBe("QUOTA");
      expect(attempts).toBe(1);
    }
  });

  it("throws redacted BAD_KEY when upstream returns 400 or 403", async () => {
    const leakedKey = "AIzaSyD-secretKeyShouldBeRedacted12345";
    const mockFetch: FetchLike = async () => {
      return new Response(`Invalid API key ${leakedKey}`, { status: 403 });
    };

    try {
      await callGemini(dummyProfile, dummyAQI, {
        apiKey: leakedKey,
        model: "gemini-3.5-flash-lite",
        fetchFn: mockFetch,
      });
      expect(true).toBe(false);
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(GeminiError);
      const gErr = err as GeminiError;
      expect(gErr.code).toBe("BAD_KEY");
      expect(gErr.message).not.toContain(leakedKey);
      expect(gErr.message).toContain("[REDACTED_KEY]");
    }
  });

  it("retries once on 5xx before throwing GEMINI_FAIL (AC-003-b)", async () => {
    let attempts = 0;
    const mockFetch: FetchLike = async () => {
      attempts++;
      return new Response("Internal Server Error", { status: 503 });
    };

    try {
      await callGemini(dummyProfile, dummyAQI, {
        apiKey: "AIzaSyD-validKeyForTesting123456",
        fetchFn: mockFetch,
      });
      expect(true).toBe(false);
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(GeminiError);
      expect((err as GeminiError).code).toBe("GEMINI_FAIL");
      expect(attempts).toBe(2);
    }
  });

  it("throws MODEL_BLOCKED when candidate is safety blocked or empty", async () => {
    const mockFetch: FetchLike = async () => {
      return new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: "SAFETY",
              content: { parts: [] },
            },
          ],
        }),
        { status: 200 }
      );
    };

    try {
      await callGemini(dummyProfile, dummyAQI, {
        apiKey: "AIzaSyD-validKeyForTesting123456",
        fetchFn: mockFetch,
      });
      expect(true).toBe(false);
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(GeminiError);
      expect((err as GeminiError).code).toBe("MODEL_BLOCKED");
    }
  });
});
