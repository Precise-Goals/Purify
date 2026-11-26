/**
 * Google Cloud Platform (GCP) Google Maps Air Quality API Connector
 *
 * Provides hyper-local pollutant data (PM2.5, PM10, O3, NO2, SO2, CO),
 * Universal AQI, dominant pollutants, and official health recommendations.
 */

import { redactSecrets } from "../sanitize";
import type { FetchLike } from "../aqi";

export interface GoogleAqiRequest {
  latitude: number;
  longitude: number;
  languageCode?: string;
  extraComputations?: Array<
    | "HEALTH_RECOMMENDATIONS"
    | "DOMINANT_POLLUTANT_CONCENTRATION"
    | "POLLUTANT_CONCENTRATION"
    | "LOCAL_AQI"
  >;
}

export interface GoogleAqiResponse {
  dateTime: string;
  regionCode: string;
  indexes: Array<{
    code: string;
    displayName: string;
    aqi: number;
    aqiDisplay: string;
    color: { red: number; green: number; blue: number };
    category: string;
    dominantPollutant: string;
  }>;
  pollutants?: Array<{
    code: string;
    displayName: string;
    concentration: { value: number; units: string };
  }>;
  healthRecommendations?: {
    generalPopulation?: string;
    elderly?: string;
    lungDiseasePopulation?: string;
    heartDiseasePopulation?: string;
    athletes?: string;
    pregnantWomen?: string;
    children?: string;
  };
}

/**
 * Enterprise client for the Google Maps Air Quality API.
 */
export class GoogleAirQualityClient {
  private readonly apiKey?: string;
  private readonly fetchFn: FetchLike;

  constructor(apiKey?: string, fetchFn: FetchLike = fetch) {
    this.apiKey = apiKey !== undefined ? apiKey : process.env.GOOGLE_MAPS_API_KEY;
    this.fetchFn = fetchFn;
  }

  /**
   * Queries Google Air Quality API current conditions using header authentication.
   */
  public async getCurrentConditions(req: GoogleAqiRequest): Promise<GoogleAqiResponse> {
    if (!this.apiKey) {
      throw new Error("Google Air Quality API requires a valid GOOGLE_MAPS_API_KEY");
    }

    const endpoint = "https://airquality.googleapis.com/v1/currentConditions:lookup";

    const res = await this.fetchFn(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
      },
      body: JSON.stringify({
        location: { latitude: req.latitude, longitude: req.longitude },
        extraComputations: req.extraComputations ?? [
          "HEALTH_RECOMMENDATIONS",
          "DOMINANT_POLLUTANT_CONCENTRATION",
          "POLLUTANT_CONCENTRATION",
          "LOCAL_AQI",
        ],
        languageCode: req.languageCode || "en",
      }),
    });

    if (!res.ok) {
      const errText = redactSecrets(await res.text().catch(() => ""));
      throw new Error(`Google Air Quality API lookup failed (${res.status}): ${errText}`);
    }

    return (await res.json()) as GoogleAqiResponse;
  }
}
