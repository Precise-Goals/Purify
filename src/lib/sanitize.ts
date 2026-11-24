/**
 * Input Sanitisation and Validation
 * Defends against prompt injection, malformed keys, oversized payloads, and bad JSON.
 */

export interface ValidateKeyResult {
  valid: boolean;
  code?: "NO_KEY" | "BAD_KEY";
}

export interface PayloadSizeResult {
  valid: boolean;
  bytes: number;
}

export interface SanitizedProfile {
  city: string;
  latitude?: number;
  longitude?: number;
  homeType: "sealed" | "standard" | "leaky";
  cookingFuel: "lpg_electric" | "biomass_wood" | "kerosene";
  commuteMode: "walk_cycle" | "two_wheeler" | "carpool_transit" | "personal_car";
  budget: "low" | "medium" | "high";
  outdoorHours: number;
  hasExistingPurifier: boolean;
  notes: string;
}

export interface SanitizeProfileResult {
  profile?: SanitizedProfile;
  error?: string;
}

const MAX_PAYLOAD_BYTES = 8192; // 8 KB body cap
const MAX_FREE_TEXT_LENGTH = 300;

/**
 * Validates the Gemini API key format (x-gemini-key).
 * Returns NO_KEY if missing, BAD_KEY if invalid format.
 */
export function validateGeminiKey(key: unknown): ValidateKeyResult {
  if (typeof key !== "string" || !key.trim()) {
    return { valid: false, code: "NO_KEY" };
  }

  const trimmed = key.trim();
  // Valid Google API keys are alphanumeric with hyphens/underscores, at least 20 chars
  // Typically AIzaSy... but test mocks may vary; enforce minimum length 20 and valid charset
  if (trimmed.length < 20 || !/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { valid: false, code: "BAD_KEY" };
  }

  return { valid: true };
}

/**
 * Verifies that the raw request body does not exceed 8 KB.
 */
export function checkPayloadSize(rawBodyString: string): PayloadSizeResult {
  const bytes = new TextEncoder().encode(rawBodyString).length;
  return {
    valid: bytes <= MAX_PAYLOAD_BYTES,
    bytes,
  };
}

/**
 * Strips HTML, script tags, and non-printable control characters.
 * Preserves unicode (Hindi, Marathi, Chinese, etc.).
 * Caps length to 300 chars.
 */
export function sanitizeFreeText(
  input: unknown,
  maxLength: number = MAX_FREE_TEXT_LENGTH
): string {
  if (typeof input !== "string") return "";

  // 1. Strip non-printable ASCII control characters (keep regular whitespace/newlines)
  // eslint-disable-next-line no-control-regex
  let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 2. Strip HTML/XML/script markup
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  // 3. Normalize multiple whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 4. Cap at maxLength unicode characters
  return Array.from(cleaned).slice(0, maxLength).join("");
}

/**
 * Sanitizes and validates incoming household profile.
 */
export function sanitizeProfile(raw: unknown): SanitizeProfileResult {
  if (!raw || typeof raw !== "object") {
    return { error: "Invalid profile payload: must be a JSON object" };
  }

  const obj = raw as Record<string, unknown>;

  const city = sanitizeFreeText(obj.city ?? "Delhi", 80);
  const notes = sanitizeFreeText(obj.notes ?? "", 300);

  let outdoorHours = 2;
  if (typeof obj.outdoorHours === "number") {
    outdoorHours = obj.outdoorHours;
  } else if (typeof obj.outdoorHours === "string") {
    const parsed = parseFloat(obj.outdoorHours);
    if (!isNaN(parsed)) outdoorHours = parsed;
  }
  outdoorHours = Math.max(0, Math.min(16, outdoorHours));

  const hasExistingPurifier =
    obj.hasExistingPurifier === true || obj.hasExistingPurifier === "true";

  const validHomeTypes = ["sealed", "standard", "leaky"] as const;
  const homeType = validHomeTypes.includes(obj.homeType as any)
    ? (obj.homeType as "sealed" | "standard" | "leaky")
    : "standard";

  const validCooking = ["lpg_electric", "biomass_wood", "kerosene"] as const;
  const cookingFuel = validCooking.includes(obj.cookingFuel as any)
    ? (obj.cookingFuel as "lpg_electric" | "biomass_wood" | "kerosene")
    : "lpg_electric";

  const validCommute = ["walk_cycle", "two_wheeler", "carpool_transit", "personal_car"] as const;
  const commuteMode = validCommute.includes(obj.commuteMode as any)
    ? (obj.commuteMode as "walk_cycle" | "two_wheeler" | "carpool_transit" | "personal_car")
    : "carpool_transit";

  const validBudget = ["low", "medium", "high"] as const;
  const budget = validBudget.includes(obj.budget as any)
    ? (obj.budget as "low" | "medium" | "high")
    : "medium";

  let latitude: number | undefined;
  if (typeof obj.latitude === "number" && !isNaN(obj.latitude) && obj.latitude >= -90 && obj.latitude <= 90) {
    latitude = obj.latitude;
  }

  let longitude: number | undefined;
  if (typeof obj.longitude === "number" && !isNaN(obj.longitude) && obj.longitude >= -180 && obj.longitude <= 180) {
    longitude = obj.longitude;
  }

  return {
    profile: {
      city,
      latitude,
      longitude,
      homeType,
      cookingFuel,
      commuteMode,
      budget,
      outdoorHours,
      hasExistingPurifier,
      notes,
    },
  };
}
