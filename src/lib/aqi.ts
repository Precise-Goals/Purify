/**
 * Live Air Quality Engine
 * Fetches ambient PM2.5 and AQI with Google AQ API as primary,
 * seamless Open-Meteo fallback, and bounded 10-minute in-memory caching.
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  displayName: string;
}

export type AQISource = "google" | "open-meteo" | "cache";

export type AQICategory =
  | "Good"
  | "Moderate"
  | "UnhealthyForSensitiveGroups"
  | "Unhealthy"
  | "VeryUnhealthy"
  | "Hazardous";

export interface CategorizeResult {
  category: AQICategory;
  isSevereHazard: boolean;
  medicalEscalation?: string;
}

export interface AirQualityData {
  aqi: number;
  pm25: number; // µg/m³
  category: AQICategory;
  source: AQISource;
  location: LocationCoordinates;
  isSevereHazard: boolean;
  medicalEscalation?: string;
  fetchedAt: string;
}

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface FetchAQIOptions {
  googleApiKey?: string;
  fetchFn?: FetchLike;
}

interface CacheItem {
  data: AirQualityData;
  expiresAt: number;
}

interface OpenMeteoGeocodeResult {
  latitude?: number;
  longitude?: number;
  name?: string;
  country?: string;
}

interface OpenMeteoGeocodeResponse {
  results?: OpenMeteoGeocodeResult[];
}

interface GoogleAQIndex {
  code?: string;
  aqi?: number;
}

interface GoogleAQPollutant {
  code?: string;
  concentration?: {
    value?: number;
  };
}

interface GoogleAQApiResponse {
  indexes?: GoogleAQIndex[];
  pollutants?: GoogleAQPollutant[];
}

interface OpenMeteoAQIResponse {
  current?: {
    pm2_5?: number;
    us_aqi?: number;
  };
}

interface RawAQIRecord {
  aqi: number;
  pm25: number;
  source: AQISource;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 500;
const aqiCache = new Map<string, CacheItem>();

/**
 * Clears the in-memory AQI cache (primarily for isolated tests).
 */
export function clearAQICache(): void {
  aqiCache.clear();
}

/**
 * Evicts expired or oldest entries to keep the cache strictly bounded.
 */
function pruneAQICache(now: number): void {
  for (const [key, item] of aqiCache.entries()) {
    if (item.expiresAt <= now) {
      aqiCache.delete(key);
    }
  }
  while (aqiCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = aqiCache.keys().next().value;
    if (oldestKey === undefined) break;
    aqiCache.delete(oldestKey);
  }
}

/**
 * Known fallback coordinates for major smog hubs in South and East Asia.
 */
const KNOWN_HUBS: Record<string, { lat: number; lon: number; name: string }> = {
  delhi: { lat: 28.6139, lon: 77.209, name: "Delhi, India" },
  "new delhi": { lat: 28.6139, lon: 77.209, name: "New Delhi, India" },
  lahore: { lat: 31.5204, lon: 74.3587, name: "Lahore, Pakistan" },
  beijing: { lat: 39.9042, lon: 116.4074, name: "Beijing, China" },
  dhaka: { lat: 23.8103, lon: 90.4125, name: "Dhaka, Bangladesh" },
  mumbai: { lat: 19.076, lon: 72.8777, name: "Mumbai, India" },
  kolkata: { lat: 22.5726, lon: 88.3639, name: "Kolkata, India" },
};

/**
 * Standard US EPA AQI category thresholds and severe health escalation logic.
 */
export function categorizeAQI(aqi: number): CategorizeResult {
  const rounded = Math.round(aqi);

  if (rounded <= 50) {
    return { category: "Good", isSevereHazard: false };
  }
  if (rounded <= 100) {
    return { category: "Moderate", isSevereHazard: false };
  }
  if (rounded <= 150) {
    return { category: "UnhealthyForSensitiveGroups", isSevereHazard: false };
  }
  if (rounded <= 200) {
    return { category: "Unhealthy", isSevereHazard: false };
  }
  if (rounded <= 300) {
    return { category: "VeryUnhealthy", isSevereHazard: false };
  }
  return {
    category: "Hazardous",
    isSevereHazard: true,
    medicalEscalation:
      "EMERGENCY ADVISORY: AQI exceeds 300 (Hazardous). Children, seniors, and individuals with respiratory or cardiovascular disease must seek prompt medical care if experiencing shortness of breath, continuous coughing, or chest tightness. Remain inside sealed or filtered rooms.",
  };
}

/**
 * Geocodes city text or returns explicit coordinates.
 */
export async function geocodeLocation(
  query: { city?: string; latitude?: number; longitude?: number },
  fetchFn: FetchLike = fetch
): Promise<LocationCoordinates> {
  if (typeof query.latitude === "number" && typeof query.longitude === "number") {
    return {
      latitude: query.latitude,
      longitude: query.longitude,
      displayName: query.city || `${query.latitude.toFixed(2)}, ${query.longitude.toFixed(2)}`,
    };
  }

  const rawCity = (query.city || "Delhi").trim();
  const normalized = rawCity.toLowerCase();

  if (KNOWN_HUBS[normalized]) {
    const hub = KNOWN_HUBS[normalized];
    return {
      latitude: hub.lat,
      longitude: hub.lon,
      displayName: hub.name,
    };
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      rawCity
    )}&count=1&language=en&format=json`;
    const res = await fetchFn(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = (await res.json()) as OpenMeteoGeocodeResponse;
      const top = data.results?.[0];
      if (top && typeof top.latitude === "number" && typeof top.longitude === "number") {
        const country = top.country ? `, ${top.country}` : "";
        return {
          latitude: top.latitude,
          longitude: top.longitude,
          displayName: `${top.name || rawCity}${country}`,
        };
      }
    }
  } catch {
    // Continue to approximate Delhi fallback
  }

  return {
    latitude: 28.6139,
    longitude: 77.209,
    displayName: `${rawCity} (approximate)`,
  };
}

/**
 * Fetches live pollutant readings from Google Maps Air Quality API using header auth.
 */
async function fetchFromGoogleAQ(
  loc: LocationCoordinates,
  googleApiKey: string,
  fetchFn: FetchLike
): Promise<RawAQIRecord | null> {
  try {
    const googleUrl = "https://airquality.googleapis.com/v1/currentConditions:lookup";
    const googleRes = await fetchFn(googleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": googleApiKey,
      },
      body: JSON.stringify({
        location: {
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
        extraComputations: ["LOCAL_AQI", "POLLUTANT_CONCENTRATION"],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!googleRes.ok) return null;

    const gData = (await googleRes.json()) as GoogleAQApiResponse;
    const uaqi = gData.indexes?.find((idx) => idx.code === "uaqi" || idx.code === "usa_epa");
    if (!uaqi || typeof uaqi.aqi !== "number") return null;

    const pm25Pollutant = gData.pollutants?.find((p) => p.code === "pm25");
    const pm25Val = pm25Pollutant?.concentration?.value ?? uaqi.aqi * 0.6;

    return {
      aqi: Math.round(uaqi.aqi),
      pm25: Number(pm25Val.toFixed(1)),
      source: "google",
    };
  } catch {
    return null;
  }
}

/**
 * Fetches live pollutant readings from the keyless Open-Meteo Air Quality fallback API.
 */
async function fetchFromOpenMeteo(
  loc: LocationCoordinates,
  fetchFn: FetchLike
): Promise<RawAQIRecord | null> {
  try {
    const omUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=pm2_5,us_aqi`;
    const omRes = await fetchFn(omUrl, { signal: AbortSignal.timeout(8000) });
    if (!omRes.ok) return null;

    const omData = (await omRes.json()) as OpenMeteoAQIResponse;
    const current = omData.current;
    if (!current || typeof current.pm2_5 !== "number") return null;

    const aqiVal = current.us_aqi ?? Math.round(current.pm2_5 * 1.5);
    return {
      aqi: Math.round(aqiVal),
      pm25: Number(current.pm2_5.toFixed(1)),
      source: "open-meteo",
    };
  } catch {
    return null;
  }
}

/**
 * Main Air Quality fetcher with bounded caching, Google AQ primary, and Open-Meteo fallback.
 */
export async function fetchAirQuality(
  locationInput: { city?: string; latitude?: number; longitude?: number },
  options: FetchAQIOptions = {}
): Promise<AirQualityData> {
  const fetchFn = options.fetchFn || fetch;
  const loc = await geocodeLocation(locationInput, fetchFn);

  const cacheKey = `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`;
  const now = Date.now();

  const cached = aqiCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return {
      ...cached.data,
      source: "cache",
      location: loc,
    };
  }

  let resultData: RawAQIRecord | null = null;

  if (options.googleApiKey) {
    resultData = await fetchFromGoogleAQ(loc, options.googleApiKey, fetchFn);
  }
  if (!resultData) {
    resultData = await fetchFromOpenMeteo(loc, fetchFn);
  }

  if (!resultData) {
    throw new Error(
      "AQI_UNAVAILABLE: Failed to retrieve air quality data from both Google and Open-Meteo providers."
    );
  }

  const { category, isSevereHazard, medicalEscalation } = categorizeAQI(resultData.aqi);

  const fullData: AirQualityData = {
    aqi: resultData.aqi,
    pm25: resultData.pm25,
    category,
    source: resultData.source,
    location: loc,
    isSevereHazard,
    medicalEscalation,
    fetchedAt: new Date(now).toISOString(),
  };

  if (aqiCache.size >= MAX_CACHE_ENTRIES) {
    pruneAQICache(now);
  }

  aqiCache.set(cacheKey, {
    data: fullData,
    expiresAt: now + CACHE_TTL_MS,
  });

  return fullData;
}
