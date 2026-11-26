/**
 * Input Sanitisation and Validation
 * Defends against prompt injection, malformed keys, oversized payloads,
 * secret reflection, and bad JSON.
 */

export interface ValidateKeyResult {
  valid: boolean;
  code?: "NO_KEY" | "BAD_KEY";
}

export interface PayloadSizeResult {
  valid: boolean;
  bytes: number;
}

export type HomeType = "sealed" | "standard" | "leaky";
export type CookingFuel = "lpg_electric" | "biomass_wood" | "kerosene";
export type CommuteMode = "walk_cycle" | "two_wheeler" | "carpool_transit" | "personal_car";
export type BudgetTier = "low" | "medium" | "high";

export interface SanitizedProfile {
  city: string;
  latitude?: number;
  longitude?: number;
  homeType: HomeType;
  cookingFuel: CookingFuel;
  commuteMode: CommuteMode;
  budget: BudgetTier;
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

const VALID_HOME_TYPES: readonly HomeType[] = ["sealed", "standard", "leaky"];
const VALID_COOKING_FUELS: readonly CookingFuel[] = ["lpg_electric", "biomass_wood", "kerosene"];
const VALID_COMMUTE_MODES: readonly CommuteMode[] = [
  "walk_cycle",
  "two_wheeler",
  "carpool_transit",
  "personal_car",
];
const VALID_BUDGETS: readonly BudgetTier[] = ["low", "medium", "high"];

/**
 * Picks a validated string union value without unsafe casts.
 */
function pickEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  if (typeof value === "string") {
    for (const item of allowed) {
      if (item === value) return item;
    }
  }
  return fallback;
}

/**
 * Strips non-printable ASCII control characters while preserving whitespace
 * (\t, \n, \r) and international Unicode characters.
 */
function stripControlCharacters(input: string): string {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const isAllowedControl = code === 9 || code === 10 || code === 13;
    const isAsciiControl = (code <= 31 && !isAllowedControl) || code === 127;
    if (!isAsciiControl) {
      result += input[i];
    }
  }
  return result;
}

/**
 * Redacts API keys and bearer tokens from text before returning or logging errors.
 */
export function redactSecrets(input: string): string {
  return input
    .replace(/AIza[A-Za-z0-9_.-]{10,}/g, "[REDACTED_KEY]")
    .replace(/AQ\.[A-Za-z0-9_.-]{10,}/g, "[REDACTED_KEY]")
    .replace(/Bearer\s+[A-Za-z0-9_.-]+/gi, "Bearer [REDACTED_TOKEN]")
    .replace(/([?&]key=)[^&\s]+/gi, "$1[REDACTED_KEY]");
}

/**
 * Validates the Gemini API key format (x-gemini-key).
 * Returns NO_KEY if missing, BAD_KEY if invalid format.
 */
export function validateGeminiKey(key: unknown): ValidateKeyResult {
  if (typeof key !== "string" || !key.trim()) {
    return { valid: false, code: "NO_KEY" };
  }

  const trimmed = key.trim();
  // Valid Google API keys contain alphanumerics, hyphens, underscores, or dots (e.g. AIzaSy..., AQ....)
  if (trimmed.length < 20 || !/^[A-Za-z0-9_.-]+$/.test(trimmed)) {
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
 * Preserves unicode (Hindi, Marathi, Chinese, etc.) and caps length to maxLength.
 */
export function sanitizeFreeText(
  input: unknown,
  maxLength: number = MAX_FREE_TEXT_LENGTH
): string {
  if (typeof input !== "string") return "";

  const withoutControls = stripControlCharacters(input);
  const withoutTags = withoutControls.replace(/<[^>]*>/g, "");
  const normalizedWhitespace = withoutTags.replace(/\s+/g, " ").trim();

  return Array.from(normalizedWhitespace).slice(0, maxLength).join("");
}

/**
 * Parses a finite geographic coordinate within inclusive [min, max] bounds.
 */
function parseCoordinate(value: unknown, min: number, max: number): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max) {
    return value;
  }
  return undefined;
}

/**
 * Sanitizes and validates incoming household profile.
 */
export function sanitizeProfile(raw: unknown): SanitizeProfileResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "Invalid profile payload: must be a JSON object" };
  }

  const obj = raw as Record<string, unknown>;

  const city = sanitizeFreeText(obj.city ?? "Delhi", 80) || "Delhi";
  const notes = sanitizeFreeText(obj.notes ?? "", 300);

  let outdoorHours = 2;
  if (typeof obj.outdoorHours === "number" && Number.isFinite(obj.outdoorHours)) {
    outdoorHours = obj.outdoorHours;
  } else if (typeof obj.outdoorHours === "string") {
    const parsed = parseFloat(obj.outdoorHours);
    if (Number.isFinite(parsed)) outdoorHours = parsed;
  }
  outdoorHours = Math.max(0, Math.min(16, outdoorHours));

  const hasExistingPurifier =
    obj.hasExistingPurifier === true || obj.hasExistingPurifier === "true";

  return {
    profile: {
      city,
      latitude: parseCoordinate(obj.latitude, -90, 90),
      longitude: parseCoordinate(obj.longitude, -180, 180),
      homeType: pickEnumValue(obj.homeType, VALID_HOME_TYPES, "standard"),
      cookingFuel: pickEnumValue(obj.cookingFuel, VALID_COOKING_FUELS, "lpg_electric"),
      commuteMode: pickEnumValue(obj.commuteMode, VALID_COMMUTE_MODES, "carpool_transit"),
      budget: pickEnumValue(obj.budget, VALID_BUDGETS, "medium"),
      outdoorHours,
      hasExistingPurifier,
      notes,
    },
  };
}
