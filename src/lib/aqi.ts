/**
 * Live Air Quality Engine
 * Fetches ambient PM2.5 and AQI with Google AQ API as primary,
 * seamless Open-Meteo fallback, and in-memory 10-minute caching.
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

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const aqiCache = new Map<string, CacheItem>();

export function clearAQICache(): void {
  aqiCache.clear();
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
  } else if (rounded <= 100) {
    return { category: "Moderate", isSevereHazard: false };
  } else if (rounded <= 150) {
    return { category: "UnhealthyForSensitiveGroups", isSevereHazard: false };
  } else if (rounded <= 200) {
    return { category: "Unhealthy", isSevereHazard: false };
  } else if (rounded <= 300) {
    return { category: "VeryUnhealthy", isSevereHazard: false };
  } else {
    return {
      category: "Hazardous",
      isSevereHazard: true,
      medicalEscalation:
        "EMERGENCY ADVISORY: AQI exceeds 300 (Hazardous). Children, seniors, and individuals with respiratory or cardiovascular disease must seek prompt medical care if experiencing shortness of breath, continuous coughing, or chest tightness. Remain inside sealed or filtered rooms.",
    };
  }
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

  // Check known hubs first
  if (KNOWN_HUBS[normalized]) {
    const hub = KNOWN_HUBS[normalized];
    return {
      latitude: hub.lat,
      longitude: hub.lon,
      displayName: hub.name,
    };
  }

  // Fallback to Open-Meteo Geocoding API
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      rawCity
    )}&count=1&language=en&format=json`;
    const res = await fetchFn(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data?.results && data.results.length > 0) {
        const top = data.results[0];
        const country = top.country ? `, ${top.country}` : "";
        return {
          latitude: top.latitude,
          longitude: top.longitude,
          displayName: `${top.name}${country}`,
        };
      }
    }
  } catch {
    // Continue to default
  }

  // Ultimate fallback to Delhi
  return {
    latitude: 28.6139,
    longitude: 77.209,
    displayName: `${rawCity} (approximate)`,
  };
}

/**
 * Main Air Quality fetcher with caching, Google AQ primary, and Open-Meteo fallback.
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

  let resultData: { aqi: number; pm25: number; source: AQISource } | null = null;

  // 1. Try Google Air Quality API if key is present
  if (options.googleApiKey) {
    try {
      const googleUrl = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${encodeURIComponent(
        options.googleApiKey
      )}`;
      const googleRes = await fetchFn(googleUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: {
            latitude: loc.latitude,
            longitude: loc.longitude,
          },
          extraComputations: ["LOCAL_AQI", "POLLUTANT_CONCENTRATION"],
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (googleRes.ok) {
        const gData = (await googleRes.json()) as any;
        const uaqi = gData.indexes?.find(
          (idx: any) => idx.code === "uaqi" || idx.code === "usa_epa"
        );
        const pm25Pollutant = gData.pollutants?.find(
          (p: any) => p.code === "pm25"
        );

        if (uaqi && typeof uaqi.aqi === "number") {
          const pm25Val = pm25Pollutant?.concentration?.value ?? (uaqi.aqi * 0.6);
          resultData = {
            aqi: Math.round(uaqi.aqi),
            pm25: Number(pm25Val.toFixed(1)),
            source: "google",
          };
        }
      }
    } catch {
      // Proceed to fallback
    }
  }

  // 2. Open-Meteo Air Quality Fallback (Keyless)
  if (!resultData) {
    try {
      const omUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=pm2_5,us_aqi`;
      const omRes = await fetchFn(omUrl, { signal: AbortSignal.timeout(8000) });

      if (omRes.ok) {
        const omData = (await omRes.json()) as any;
        const current = omData?.current;
        if (current && typeof current.pm2_5 === "number") {
          const aqiVal = current.us_aqi ?? Math.round(current.pm2_5 * 1.5);
          resultData = {
            aqi: Math.round(aqiVal),
            pm25: Number(current.pm2_5.toFixed(1)),
            source: "open-meteo",
          };
        }
      }
    } catch {
      // Failed both
    }
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

  // Cache for 10 minutes
  aqiCache.set(cacheKey, {
    data: fullData,
    expiresAt: now + CACHE_TTL_MS,
  });

  return fullData;
}
