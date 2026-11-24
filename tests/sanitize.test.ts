import { describe, expect, it } from "bun:test";
import {
  checkPayloadSize,
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

  it("strips control characters", () => {
    const dirty = "clean\x00\x08text\x1Fhere";
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
  it("coerces and validates full profile with defaults", () => {
    const raw = {
      city: " New Delhi ",
      outdoorHours: "3",
      hasExistingPurifier: "true",
      notes: "<b>Asthmatic child</b>",
    };
    const res = sanitizeProfile(raw);
    expect(res.error).toBeUndefined();
    expect(res.profile).toBeDefined();
    expect(res.profile?.city).toBe("New Delhi");
    expect(res.profile?.outdoorHours).toBe(3);
    expect(res.profile?.hasExistingPurifier).toBe(true);
    expect(res.profile?.notes).toBe("Asthmatic child");
    expect(res.profile?.homeType).toBe("standard"); // default
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

    // 9th request must be rejected (AC-009-a)
    const blocked = limiter.check(ip, baseTime + 900);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetSeconds).toBeGreaterThan(0);
  });

  it("resets window after 60 seconds", () => {
    const limiter = new RateLimiter({ maxRequests: 8, windowMs: 60000 });
    const ip = "10.0.0.1";
    const t0 = 100000;

    // Use all 8
    for (let i = 0; i < 8; i++) {
      limiter.check(ip, t0 + i);
    }
    expect(limiter.check(ip, t0 + 10).allowed).toBe(false);

    // After 61 seconds, window expired
    const afterWindow = limiter.check(ip, t0 + 61000);
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(7);
  });
});
