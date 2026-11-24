import { describe, expect, it } from "bun:test";
import { runPipeline } from "../src/lib/pipeline";
import { POST as planPost } from "../src/app/api/plan/route";
import { GET as healthGet } from "../src/app/api/health/route";
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

describe("pipeline: runPipeline end-to-end", () => {
  it("orchestrates all 5 stages and returns valid { air, plan, impact, trace }", async () => {
    const mockFetch: FetchLike = async (url) => {
      const urlStr = url.toString();
      // Mock AQI Open-Meteo
      if (urlStr.includes("open-meteo.com")) {
        return new Response(
          JSON.stringify({
            current: { us_aqi: 250, pm2_5: 180.0 },
          }),
          { status: 200 }
        );
      }
      // Mock Gemini API
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
                        actionIds: ["n95_mask_commute", "hepa_purifier_bedroom", "invented_fake_action"],
                        dailyRoutineTips: ["Keep morning windows shut", "Run purifier on high during night"],
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

    const result = await runPipeline(sampleProfile, {
      apiKey: "AIzaSyD-validKeyForTesting123456",
      fetchFn: mockFetch,
    });

    expect(result.air.aqi).toBe(250);
    expect(result.air.pm25).toBe(180.0);
    expect(result.plan.summary).toContain("senior citizen");
    // Verified catalog actions: invented_fake_action dropped
    expect(result.plan.actions.length).toBe(2);
    expect(result.plan.droppedActionIds).toEqual(["invented_fake_action"]);
    // Deterministic impact
    expect(result.impact.reductionPercentage).toBeGreaterThan(0);
    expect(result.impact.baselineCigaretteEquivalents).toBeGreaterThan(0);
    expect(result.impact.cigarettesSavedPerDay).toBeGreaterThan(0);
    // Trace timings
    expect(result.trace.totalMs).toBeGreaterThanOrEqual(0);
    expect(result.trace.stages.aqiMs).toBeDefined();
    expect(result.trace.stages.geminiMs).toBeDefined();
    expect(result.trace.stages.impactMs).toBeDefined();
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
});
