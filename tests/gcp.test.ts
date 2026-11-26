import { describe, expect, it } from "bun:test";
import {
  BigQueryAnalyticsService,
  FirestoreAuditService,
  GoogleAirQualityClient,
  PURIFY_GCP_STACK,
  PubSubPublisher,
  VertexAIService,
} from "../src/lib/gcp";

describe("gcp: PURIFY_GCP_STACK & architecture connectors", () => {
  it("exports all 6 Google Cloud Platform blueprint components", () => {
    expect(PURIFY_GCP_STACK.length).toBe(6);
    expect(PURIFY_GCP_STACK.some((item) => item.service.includes("Vertex AI"))).toBe(true);
    expect(PURIFY_GCP_STACK.some((item) => item.service.includes("BigQuery"))).toBe(true);
  });

  it("handles VertexAIService metadata, header auth generation, and redacted failures", async () => {
    const vertex = new VertexAIService({
      projectId: "purify-test",
      location: "us-central1",
      modelName: "gemini-3.5-flash-lite",
      apiKey: "AIzaSyFakeVertexKeyForUnitTest",
      fetchFn: async (_url, init) => {
        const headers = init?.headers as Record<string, string> | undefined;
        expect(headers?.["x-goog-api-key"]).toBe("AIzaSyFakeVertexKeyForUnitTest");
        return new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: JSON.stringify({ plan: "ok" }) }] } }],
          }),
          { status: 200 }
        );
      },
    });
    const meta = vertex.getMetadata();
    expect(meta.projectId).toBe("purify-test");
    expect(meta.endpointType).toBe("Google AI Studio Developer API");

    const generated = await vertex.generateStructuredPlan<{ plan: string }>("Prompt", {
      systemInstruction: "Sys",
    });
    expect(generated.data.plan).toBe("ok");

    const failingVertex = new VertexAIService({
      apiKey: "AIzaSySecretKeyShouldRedact12345",
      fetchFn: async () =>
        new Response("Bad key AIzaSySecretKeyShouldRedact12345", { status: 403 }),
    });
    await expect(failingVertex.generateStructuredPlan("Prompt")).rejects.toThrow("[REDACTED_KEY]");
  });

  it("queries GoogleAirQualityClient with X-Goog-Api-Key header and handles failures", async () => {
    const clientNoKey = new GoogleAirQualityClient("");
    await expect(
      clientNoKey.getCurrentConditions({ latitude: 28.6, longitude: 77.2 })
    ).rejects.toThrow("GOOGLE_MAPS_API_KEY");

    const client = new GoogleAirQualityClient("AIzaSyMapsKey1234567890", async (_url, init) => {
      const headers = init?.headers as Record<string, string> | undefined;
      expect(headers?.["X-Goog-Api-Key"]).toBe("AIzaSyMapsKey1234567890");
      return new Response(
        JSON.stringify({
          dateTime: "2026-11-26T00:00:00Z",
          regionCode: "IN",
          indexes: [],
        }),
        { status: 200 }
      );
    });
    const aq = await client.getCurrentConditions({ latitude: 28.61, longitude: 77.2 });
    expect(aq.regionCode).toBe("IN");

    const failingClient = new GoogleAirQualityClient("AIzaSyMapsKey1234567890", async () =>
      new Response("Unauthorized AIzaSyMapsKey1234567890", { status: 403 })
    );
    await expect(
      failingClient.getCurrentConditions({ latitude: 28.61, longitude: 77.2 })
    ).rejects.toThrow("[REDACTED_KEY]");
  });

  it("handles local fallback and REST dispatch across Firestore, PubSub, and BigQuery cleanly", async () => {
    const sampleEvent = {
      sessionId: "sess-1",
      timestamp: new Date().toISOString(),
      city: "Delhi",
      aqi: 200,
      pm25: 140,
      actionsSelectedCount: 3,
      reductionPercentage: 64.5,
      latencyMs: 320,
    };

    const firestoreMock = new FirestoreAuditService({ isConfigured: false });
    const fsRes = await firestoreMock.logAnonymizedEvent(sampleEvent);
    expect(fsRes.id.startsWith("evt_")).toBe(true);
    expect(fsRes.success).toBe(true);

    const firestoreHttp = new FirestoreAuditService({
      isConfigured: true,
      accessToken: "tok-123",
      fetchFn: async () => new Response("{}", { status: 200 }),
    });
    expect((await firestoreHttp.logAnonymizedEvent(sampleEvent)).success).toBe(true);

    const firestoreErr = new FirestoreAuditService({
      isConfigured: true,
      fetchFn: async () => {
        throw new Error("network");
      },
    });
    expect((await firestoreErr.logAnonymizedEvent(sampleEvent)).success).toBe(false);

    const pubsubMock = new PubSubPublisher("purify-alerts");
    expect((await pubsubMock.publishEvent({ city: "Delhi", aqi: 350 })).messageId).toContain(
      "msg_"
    );

    const pubsubHttp = new PubSubPublisher("purify-alerts", {
      accessToken: "tok-ps",
      fetchFn: async () => new Response(JSON.stringify({ messageIds: ["msg_live_1"] }), { status: 200 }),
    });
    expect((await pubsubHttp.publishEvent({ aqi: 400 })).messageId).toBe("msg_live_1");

    const pubsubErr = new PubSubPublisher("purify-alerts", {
      accessToken: "tok-ps",
      fetchFn: async () => new Response("error", { status: 500 }),
    });
    expect((await pubsubErr.publishEvent({ aqi: 400 })).messageId).toBe("msg_err_500");

    const bqRecord = {
      insertId: "row-1",
      timestamp: new Date().toISOString(),
      city_name: "Delhi",
      ambient_aqi: 250,
      ambient_pm25: 175,
      mitigated_pm25: 65,
      reduction_pct: 62.9,
      cigarettes_avoided: 5.0,
      housing_type: "standard",
      commute_type: "carpool_transit",
      interventions_applied: ["n95_mask_commute"],
    };

    const bqMock = new BigQueryAnalyticsService();
    expect(bqMock.getSchemaDefinition().length).toBe(10);
    expect((await bqMock.streamRecord(bqRecord)).inserted).toBe(true);

    const bqHttp = new BigQueryAnalyticsService({
      accessToken: "tok-bq",
      fetchFn: async () => new Response("{}", { status: 200 }),
    });
    expect((await bqHttp.streamRecord(bqRecord)).inserted).toBe(true);

    const bqErr = new BigQueryAnalyticsService({
      accessToken: "tok-bq",
      fetchFn: async () => {
        throw new Error("bq down");
      },
    });
    expect((await bqErr.streamRecord(bqRecord)).inserted).toBe(false);
  });
});
