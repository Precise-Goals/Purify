import { describe, expect, it } from "bun:test";
import {
  checkPayloadSize,
  redactSecrets,
  sanitizeFreeText,
  sanitizeProfile,
  validateGeminiKey,
} from "../src/lib/sanitize";
import { RateLimiter } from "../src/lib/rate-limiter";

describe("sanitize: validateGeminiKey (AC-007-a)", () => {
  it("returns NO_KEY when key is missing, empty, or whitespace", () => {
    expect(validateGeminiKey(undefined).code).toBe("NO_KEY");
    expect(validateGeminiKey("").code).toBe("NO_KEY");
    expect(validateGeminiKey("   ").code).toBe("NO_KEY");
  });

  it("returns BAD_KEY when key is malformed or too short", () => {
    expect(validateGeminiKey("short").code).toBe("BAD_KEY");
    expect(validateGeminiKey("not-a-valid-gemini-key!@#$").code).toBe("BAD_KEY");
  });

  it("approves valid Gemini API key format", () => {
    const validKey = "AIzaSyD-fakeKeyForTestingPurposesOnly123456";
    const res = validateGeminiKey(validKey);
    expect(res.valid).toBe(true);
    expect(res.code).toBeUndefined();
  });

  it("approves Google Cloud / Vertex AI keys with AQ. prefix containing dots", () => {
    const aqKey = "AQ.fakeMockTestKeyWithDotsAndHyphens123456789";
    const res = validateGeminiKey(aqKey);
    expect(res.valid).toBe(true);
    expect(res.code).toBeUndefined();
  });
});

describe("sanitize: redactSecrets", () => {
  it("redacts AIza keys, AQ. keys, bearer tokens, and key query parameters", () => {
    const sample =
      "Error using AIzaSyFakeKey1234567890 and AQ.FakeVertexKey987654321 and Bearer secret_tok_abc and ?key=mysecret123";
    const redacted = redactSecrets(sample);
    expect(redacted).not.toContain("AIzaSyFakeKey");
    expect(redacted).not.toContain("AQ.FakeVertexKey");
    expect(redacted).not.toContain("secret_tok_abc");
    expect(redacted).not.toContain("mysecret123");
    expect(redacted).toContain("[REDACTED_KEY]");
    expect(redacted).toContain("[REDACTED_TOKEN]");
  });
});

describe("sanitize: checkPayloadSize (AC-009-b)", () => {
  it("allows payload under 8 KB", () => {
    const smallPayload = JSON.stringify({ city: "Delhi", outdoorHours: 2 });
    const res = checkPayloadSize(smallPayload);
    expect(res.valid).toBe(true);
    expect(res.bytes).toBeLessThan(8192);
  });

  it("rejects payload exceeding 8 KB (8192 bytes)", () => {
    const largeString = "a".repeat(8200);
    const res = checkPayloadSize(largeString);
    expect(res.valid).toBe(false);
    expect(res.bytes).toBeGreaterThan(8192);
  });
});

describe("sanitize: sanitizeFreeText", () => {
  it("strips HTML, XML, script tags to prevent prompt injection / XSS", () => {
    const dirty = "Hello <script>alert(1)</script> and <b onclick='hack()'>world</b>";
    const clean = sanitizeFreeText(dirty);
    expect(clean).toBe("Hello alert(1) and world");
    expect(clean).not.toContain("<");
    expect(clean).not.toContain(">");
  });

  it("strips control characters and ignores non-string values", () => {
    expect(sanitizeFreeText(12345)).toBe("");
    const dirty = "clean\x00\x08text\x1F\x7Fhere";
    const clean = sanitizeFreeText(dirty);
    expect(clean).toBe("cleantexthere");
  });

  it("caps text at 300 characters", () => {
    const longText = "X".repeat(500);
    const clean = sanitizeFreeText(longText);
    expect(clean.length).toBe(300);
  });

  it("preserves international Unicode characters (Hindi, Marathi)", () => {
    const hindi = "नमस्ते, हमारे घर में छोटा बच्चा है।";
    const clean = sanitizeFreeText(hindi);
    expect(clean).toBe(hindi);
  });
});

describe("sanitize: sanitizeProfile", () => {
  it("rejects non-object and array payloads", () => {
    expect(sanitizeProfile(null).error).toBeDefined();
    expect(sanitizeProfile(["Delhi"]).error).toBeDefined();
    expect(sanitizeProfile("Delhi").error).toBeDefined();
  });

  it("coerces and validates full profile including coordinates and enum fields", () => {
    const raw = {
      city: " New Delhi ",
      latitude: 28.6139,
      longitude: 77.209,
      outdoorHours: "3",
      homeType: "sealed",
      cookingFuel: "biomass_wood",
      commuteMode: "two_wheeler",
      budget: "low",
      hasExistingPurifier: "true",
      notes: "<b>Asthmatic child</b>",
    };
    const res = sanitizeProfile(raw);
    expect(res.error).toBeUndefined();
    expect(res.profile).toBeDefined();
    expect(res.profile?.city).toBe("New Delhi");
    expect(res.profile?.latitude).toBe(28.6139);
    expect(res.profile?.longitude).toBe(77.209);
    expect(res.profile?.outdoorHours).toBe(3);
    expect(res.profile?.homeType).toBe("sealed");
    expect(res.profile?.cookingFuel).toBe("biomass_wood");
    expect(res.profile?.commuteMode).toBe("two_wheeler");
    expect(res.profile?.budget).toBe("low");
    expect(res.profile?.hasExistingPurifier).toBe(true);
    expect(res.profile?.notes).toBe("Asthmatic child");
  });

  it("drops out-of-range coordinates and falls back on unknown enums", () => {
    const res = sanitizeProfile({
      latitude: 120,
      longitude: -220,
      homeType: "spaceship",
      budget: "infinite",
      outdoorHours: 50,
    });
    expect(res.profile?.latitude).toBeUndefined();
    expect(res.profile?.longitude).toBeUndefined();
    expect(res.profile?.homeType).toBe("standard");
    expect(res.profile?.budget).toBe("medium");
    expect(res.profile?.outdoorHours).toBe(16);
  });
});

describe("rate-limiter: RateLimiter (AC-009-a)", () => {
  it("allows up to 8 requests per minute from a single IP", () => {
    const limiter = new RateLimiter({ maxRequests: 8, windowMs: 60000 });
    const ip = "192.168.1.100";
    const baseTime = 100000;

    for (let i = 1; i <= 8; i++) {
      const res = limiter.check(ip, baseTime + i * 100);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(8 - i);
    }

    const blocked = limiter.check(ip, baseTime + 900);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetSeconds).toBeGreaterThan(0);
  });

  it("resets window after 60 seconds and prunes expired entries cleanly", () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 60000, maxEntries: 2 });
    const t0 = 100000;

    limiter.check("10.0.0.1", t0);
    limiter.check("10.0.0.2", t0);
    // Expired buckets should be pruned when inserting a 3rd entry beyond maxEntries
    const afterWindow = limiter.check("10.0.0.3", t0 + 61000);
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(1);

    limiter.clear();
    expect(limiter.check("10.0.0.1", t0 + 62000).remaining).toBe(1);
  });
});
