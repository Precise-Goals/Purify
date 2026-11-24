import { describe, expect, it } from "bun:test";
import {
  categorizeAQI,
  clearAQICache,
  fetchAirQuality,
  geocodeLocation,
  type FetchLike,
} from "../src/lib/aqi";

describe("aqi: categorizeAQI (AC-014-a)", () => {
  it("categorizes standard US AQI breakpoints correctly", () => {
    expect(categorizeAQI(25).category).toBe("Good");
    expect(categorizeAQI(75).category).toBe("Moderate");
    expect(categorizeAQI(125).category).toBe("UnhealthyForSensitiveGroups");
    expect(categorizeAQI(175).category).toBe("Unhealthy");
    expect(categorizeAQI(250).category).toBe("VeryUnhealthy");
    expect(categorizeAQI(350).category).toBe("Hazardous");
  });

  it("marks AQI >= 300 as severe hazard with medical escalation (AC-014-a)", () => {
    const below300 = categorizeAQI(290);
    expect(below300.isSevereHazard).toBe(false);
    expect(below300.medicalEscalation).toBeUndefined();

    const above300 = categorizeAQI(385);
    expect(above300.isSevereHazard).toBe(true);
    expect(above300.medicalEscalation).toBeDefined();
    expect(above300.medicalEscalation?.toLowerCase()).toContain("medical");
  });
});

describe("aqi: geocodeLocation (AC-001-c)", () => {
  it("uses provided lat/long directly without network (AC-001-c)", async () => {
    const loc = await geocodeLocation({
      latitude: 28.6139,
      longitude: 77.209,
      city: "IgnoredCity",
    });
    expect(loc.latitude).toBe(28.6139);
    expect(loc.longitude).toBe(77.209);
  });

  it("resolves major smog hub cities using fallback index", async () => {
    const delhi = await geocodeLocation({ city: "Delhi" });
    expect(delhi.latitude).toBeCloseTo(28.6139, 1);
    expect(delhi.longitude).toBeCloseTo(77.209, 1);

    const lahore = await geocodeLocation({ city: "Lahore" });
    expect(lahore.latitude).toBeCloseTo(31.5204, 1);
    expect(lahore.longitude).toBeCloseTo(74.3587, 1);
  });
});

describe("aqi: fetchAirQuality with mock injected fetch", () => {
  it("fetches from Google AQ API when key provided and succeeds (AC-001-a)", async () => {
    clearAQICache();
    const mockFetch: FetchLike = async (url) => {
      if (typeof url === "string" && url.includes("airquality.googleapis.com")) {
        return new Response(
          JSON.stringify({
            indexes: [
              {
                code: "uaqi",
                aqi: 180,
                category: "Unhealthy",
              },
            ],
            pollutants: [
              {
                code: "pm25",
                concentration: { value: 112.5 },
              },
            ],
          }),
          { status: 200 }
        );
      }
      return new Response("Not found", { status: 404 });
    };

    const res = await fetchAirQuality(
      { city: "Delhi", latitude: 28.61, longitude: 77.2 },
      { googleApiKey: "test-google-key", fetchFn: mockFetch }
    );

    expect(res.source).toBe("google");
    expect(res.aqi).toBe(180);
    expect(res.pm25).toBe(112.5);
    expect(res.category).toBe("Unhealthy");
  });

  it("falls back to Open-Meteo when Google fails or has no key (AC-001-b)", async () => {
    clearAQICache();
    const mockFetch: FetchLike = async (url) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("open-meteo.com")) {
        return new Response(
          JSON.stringify({
            current: {
              us_aqi: 220,
              pm2_5: 170.0,
            },
          }),
          { status: 200 }
        );
      }
      return new Response("Unauthorized", { status: 401 });
    };

    const res = await fetchAirQuality(
      { city: "Delhi", latitude: 28.61, longitude: 77.2 },
      { googleApiKey: undefined, fetchFn: mockFetch }
    );

    expect(res.source).toBe("open-meteo");
    expect(res.aqi).toBe(220);
    expect(res.pm25).toBe(170.0);
    expect(res.category).toBe("VeryUnhealthy");
  });

  it("serves subsequent request from 10-minute cache with source=cache", async () => {
    let callCount = 0;
    const mockFetch: FetchLike = async () => {
      callCount++;
      return new Response(
        JSON.stringify({
          current: {
            us_aqi: 75,
            pm2_5: 23.5,
          },
        }),
        { status: 200 }
      );
    };

    const loc = { latitude: 19.076, longitude: 72.877, city: "Mumbai" };
    const first = await fetchAirQuality(loc, { fetchFn: mockFetch });
    expect(first.source).toBe("open-meteo");
    expect(callCount).toBe(1);

    const second = await fetchAirQuality(loc, { fetchFn: mockFetch });
    expect(second.source).toBe("cache");
    expect(second.aqi).toBe(75);
    expect(callCount).toBe(1); // network was NOT called again
  });

  it("throws error with code AQI_UNAVAILABLE if both Google and Open-Meteo fail (AC-007-c)", async () => {
    clearAQICache();
    const failingFetch: FetchLike = async () => {
      return new Response("Service Down", { status: 503 });
    };

    expect(
      fetchAirQuality(
        { latitude: 20.0, longitude: 80.0, city: "Remote" },
        { googleApiKey: "key", fetchFn: failingFetch }
      )
    ).rejects.toThrow("AQI_UNAVAILABLE");
  });
});
