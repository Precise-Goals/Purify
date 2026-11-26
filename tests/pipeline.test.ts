import { describe, expect, it } from "bun:test";
import { runPipeline } from "../src/lib/pipeline";
import { handlePlanRequest } from "../src/lib/plan-handler";
import { POST as planPost } from "../src/app/api/plan/route";
import { GET as healthGet } from "../src/app/api/health/route";
import { GeminiError } from "../src/lib/gemini";
import { RateLimiter } from "../src/lib/rate-limiter";
import type { SanitizedProfile } from "../src/lib/sanitize";
import type { FetchLike } from "../src/lib/aqi";

const sampleProfile: SanitizedProfile = {
  city: "Delhi",
  latitude: 28.6139,
  longitude: 77.209,
  homeType: "standard",
  cookingFuel: "lpg_electric",
  commuteMode: "carpool_transit",
  budget: "medium",
  outdoorHours: 3,
  hasExistingPurifier: false,
  notes: "Family of 4 with a senior citizen",
};

function createMockFetch(actionIds: string[]): FetchLike {
  return async (url) => {
    const urlStr = url.toString();
    if (urlStr.includes("open-meteo.com")) {
      return new Response(JSON.stringify({ current: { us_aqi: 250, pm2_5: 180.0 } }), {
        status: 200,
      });
    }
    if (urlStr.includes("generativelanguage.googleapis.com")) {
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      summary: "Special winter routine for senior citizen household in Delhi.",
                      actionIds,
                      dailyRoutineTips: [
                        "Keep morning windows shut",
                        "Run purifier on high during night",
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200 }
      );
    }
    return new Response("Not found", { status: 404 });
  };
}

describe("pipeline: runPipeline end-to-end", () => {
  it("orchestrates all 5 stages and returns valid { air, plan, impact, trace }", async () => {
    const result = await runPipeline(sampleProfile, {
      apiKey: "AIzaSyD-validKeyForTesting123456",
      fetchFn: createMockFetch([
        "n95_mask_commute",
        "hepa_purifier_bedroom",
        "invented_fake_action",
      ]),
    });

    expect(result.air.aqi).toBe(250);
    expect(result.air.pm25).toBe(180.0);
    expect(result.plan.summary).toContain("senior citizen");
    expect(result.plan.actions.length).toBe(2);
    expect(result.plan.droppedActionIds).toEqual(["invented_fake_action"]);
    expect(result.impact.reductionPercentage).toBeGreaterThan(0);
    expect(result.impact.baselineCigaretteEquivalents).toBeGreaterThan(0);
    expect(result.impact.cigarettesSavedPerDay).toBeGreaterThan(0);
    expect(result.trace.totalMs).toBeGreaterThanOrEqual(0);
    expect(result.trace.stages.aqiMs).toBeDefined();
    expect(result.trace.stages.geminiMs).toBeDefined();
    expect(result.trace.stages.impactMs).toBeDefined();
  });

  it("throws MODEL_EMPTY when all suggested action IDs fail catalog validation", async () => {
    await expect(
      runPipeline(sampleProfile, {
        apiKey: "AIzaSyD-validKeyForTesting123456",
        fetchFn: createMockFetch(["totally_hallucinated_id"]),
      })
    ).rejects.toThrow(/MODEL_EMPTY/);
  });
});

describe("api: health check endpoint (GET /api/health)", () => {
  it("returns HTTP 200 with service info", async () => {
    const res = await healthGet();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("healthy");
    expect(data.service).toBe("breathewise");
  });
});

describe("api: plan route endpoint (POST /api/plan)", () => {
  it("returns 401 NO_KEY when x-gemini-key header is absent", async () => {
    const req = new Request("http://localhost:3000/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: "Delhi" }),
    });

    const res = await planPost(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("NO_KEY");
  });

  it("returns 401 BAD_KEY when x-gemini-key format is invalid", async () => {
    const limiter = new RateLimiter();
    const req = new Request("http://localhost:3000/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-gemini-key": "invalid!key" },
      body: JSON.stringify({ city: "Delhi" }),
    });

    const res = await handlePlanRequest(req, { rateLimiter: limiter });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("BAD_KEY");
  });

  it("returns 415 UNSUPPORTED_MEDIA_TYPE for non-JSON Content-Type", async () => {
    const limiter = new RateLimiter();
    const req = new Request("http://localhost:3000/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "x-gemini-key": "AIzaSyD-validKeyForTesting123456",
      },
      body: JSON.stringify({ city: "Delhi" }),
    });

    const res = await handlePlanRequest(req, { rateLimiter: limiter });
    expect(res.status).toBe(415);
    expect((await res.json()).error).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("returns 413 when payload exceeds 8 KB", async () => {
    const oversizedBody = JSON.stringify({ city: "Delhi", notes: "x".repeat(9000) });
    const req = new Request("http://localhost:3000/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gemini-key": "AIzaSyD-validKeyForTesting123456",
      },
      body: oversizedBody,
    });

    const res = await planPost(req);
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.error).toBe("BODY_TOO_LARGE");
  });

  it("returns 400 BAD_JSON on malformed JSON payload and 422 VALIDATION_FAILED on array payload", async () => {
    const limiter = new RateLimiter();

    const badJsonReq = new Request("http://localhost:3000/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gemini-key": "AIzaSyD-validKeyForTesting123456",
      },
      body: "{not-json",
    });
    const badJsonRes = await handlePlanRequest(badJsonReq, { rateLimiter: limiter });
    expect(badJsonRes.status).toBe(400);
    expect((await badJsonRes.json()).error).toBe("BAD_JSON");

    const invalidProfileReq = new Request("http://localhost:3000/api/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gemini-key": "AIzaSyD-validKeyForTesting123456",
      },
      body: JSON.stringify(["not-an-object"]),
    });
    const invalidProfileRes = await handlePlanRequest(invalidProfileReq, {
      rateLimiter: limiter,
    });
    expect(invalidProfileRes.status).toBe(422);
    expect((await invalidProfileRes.json()).error).toBe("VALIDATION_FAILED");
  });

  it("returns 429 RATE_LIMITED with Retry-After header when client exceeds limit", async () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 60000 });
    const headers = {
      "Content-Type": "application/json",
      "x-forwarded-for": "203.0.113.9",
    };

    await handlePlanRequest(
      new Request("http://localhost:3000/api/plan", { method: "POST", headers, body: "{}" }),
      { rateLimiter: limiter }
    );
    const limitedRes = await handlePlanRequest(
      new Request("http://localhost:3000/api/plan", { method: "POST", headers, body: "{}" }),
      { rateLimiter: limiter }
    );

    expect(limitedRes.status).toBe(429);
    expect(limitedRes.headers.get("Retry-After")).toBeDefined();
    expect((await limitedRes.json()).error).toBe("RATE_LIMITED");
  });

  it("returns 200 OK with full pipeline output and maps upstream error codes cleanly", async () => {
    const limiter = new RateLimiter({ maxRequests: 20 });
    const headers = {
      "Content-Type": "application/json",
      "x-gemini-key": "AIzaSyD-validKeyForTesting123456",
    };

    const okRes = await handlePlanRequest(
      new Request("http://localhost:3000/api/plan", {
        method: "POST",
        headers,
        body: JSON.stringify({ city: "Delhi", outdoorHours: 2 }),
      }),
      {
        rateLimiter: limiter,
        runPipelineFn: async (profile, options) =>
          runPipeline(profile, {
            ...options,
            fetchFn: createMockFetch(["n95_mask_commute"]),
          }),
      }
    );
    expect(okRes.status).toBe(200);
    expect(okRes.headers.get("Cache-Control")).toContain("no-store");

    const quotaRes = await handlePlanRequest(
      new Request("http://localhost:3000/api/plan", {
        method: "POST",
        headers,
        body: JSON.stringify({ city: "Delhi" }),
      }),
      {
        rateLimiter: limiter,
        runPipelineFn: async () => {
          throw new GeminiError("QUOTA", "Rate limited");
        },
      }
    );
    expect(quotaRes.status).toBe(429);

    const aqiRes = await handlePlanRequest(
      new Request("http://localhost:3000/api/plan", {
        method: "POST",
        headers,
        body: JSON.stringify({ city: "Delhi" }),
      }),
      {
        rateLimiter: limiter,
        runPipelineFn: async () => {
          throw new Error("AQI_UNAVAILABLE");
        },
      }
    );
    expect(aqiRes.status).toBe(502);
    expect((await aqiRes.json()).error).toBe("AQI_UNAVAILABLE");

    const internalRes = await handlePlanRequest(
      new Request("http://localhost:3000/api/plan", {
        method: "POST",
        headers,
        body: JSON.stringify({ city: "Delhi" }),
      }),
      {
        rateLimiter: limiter,
        runPipelineFn: async () => {
          throw new Error("unexpected boom");
        },
      }
    );
    expect(internalRes.status).toBe(500);
    expect((await internalRes.json()).error).toBe("INTERNAL_ERROR");
  });
});
