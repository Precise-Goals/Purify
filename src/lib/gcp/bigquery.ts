/**
 * Google Cloud Platform (GCP) BigQuery Streaming Analytics Adapter
 * 
 * Defines schema and streaming pipeline for high-scale urban air quality research,
 * exposure reduction analytics, and cohort environmental health tracking.
 */

export interface BigQuerySmogRecord {
  insertId: string;
  timestamp: string;
  city_name: string;
  ambient_aqi: number;
  ambient_pm25: number;
  mitigated_pm25: number;
  reduction_pct: number;
  cigarettes_avoided: number;
  housing_type: string;
  commute_type: string;
  interventions_applied: string[];
}

export class BigQueryAnalyticsService {
  private datasetId = "purify_analytics";
  private tableId = "daily_smog_mitigations";
  private projectId: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || "purify-gcp-production";
  }

  /**
   * Returns standard BigQuery schema definition for reproducible terraform / GCP provisioning.
   */
  public getSchemaDefinition() {
    return [
      { name: "timestamp", type: "TIMESTAMP", mode: "REQUIRED" },
      { name: "city_name", type: "STRING", mode: "REQUIRED" },
      { name: "ambient_aqi", type: "INT64", mode: "REQUIRED" },
      { name: "ambient_pm25", type: "FLOAT64", mode: "REQUIRED" },
      { name: "mitigated_pm25", type: "FLOAT64", mode: "REQUIRED" },
      { name: "reduction_pct", type: "FLOAT64", mode: "REQUIRED" },
      { name: "cigarettes_avoided", type: "FLOAT64", mode: "REQUIRED" },
      { name: "housing_type", type: "STRING", mode: "NULLABLE" },
      { name: "commute_type", type: "STRING", mode: "NULLABLE" },
      { name: "interventions_applied", type: "STRING", mode: "REPEATED" },
    ];
  }

  /**
   * Streams a row to BigQuery table via streaming insert API.
   */
  public async streamRecord(record: BigQuerySmogRecord): Promise<{ inserted: boolean }> {
    if (!process.env.GOOGLE_ACCESS_TOKEN) {
      return { inserted: true }; // Mock/simulated success in local development
    }

    const endpoint = `https://bigquery.googleapis.com/bigquery/v2/projects/${this.projectId}/datasets/${this.datasetId}/tables/${this.tableId}/insertAll`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          rows: [{ insertId: record.insertId, json: record }],
        }),
      });

      return { inserted: res.ok };
    } catch {
      return { inserted: false };
    }
  }
}
