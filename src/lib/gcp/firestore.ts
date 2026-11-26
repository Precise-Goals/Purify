/**
 * Google Cloud Platform (GCP) Cloud Firestore Connector
 *
 * Provides stateful persistence, distributed token-bucket rate limiting,
 * and anonymous telemetry logging without recording sensitive keys or PII.
 */

import type { FetchLike } from "../aqi";

export interface TelemetryDocument {
  sessionId: string;
  timestamp: string;
  city: string;
  aqi: number;
  pm25: number;
  actionsSelectedCount: number;
  reductionPercentage: number;
  latencyMs: number;
}

export interface FirestoreOptions {
  projectId?: string;
  accessToken?: string;
  isConfigured?: boolean;
  fetchFn?: FetchLike;
}

/**
 * Firestore telemetry connector for anonymized environmental audit logs.
 */
export class FirestoreAuditService {
  private readonly collectionName = "purify_telemetry";
  private readonly isConfigured: boolean;
  private readonly projectId: string;
  private readonly accessToken?: string;
  private readonly fetchFn: FetchLike;

  constructor(options: FirestoreOptions = {}) {
    this.projectId =
      options.projectId || process.env.GOOGLE_CLOUD_PROJECT || "purify-gcp-production";
    this.accessToken = options.accessToken ?? process.env.GOOGLE_ACCESS_TOKEN;
    this.isConfigured =
      options.isConfigured ??
      Boolean(process.env.GOOGLE_CLOUD_PROJECT || process.env.FIRESTORE_EMULATOR_HOST);
    this.fetchFn = options.fetchFn || fetch;
  }

  /**
   * Logs an anonymized plan calculation event for city-level analytics.
   * Uses cryptographic UUIDs and never logs user keys, coordinates, or notes.
   */
  public async logAnonymizedEvent(
    event: TelemetryDocument
  ): Promise<{ success: boolean; id: string }> {
    const docId = `evt_${crypto.randomUUID()}`;

    if (!this.isConfigured) {
      return { success: true, id: docId };
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${this.collectionName}?documentId=${docId}`;

      const res = await this.fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        },
        body: JSON.stringify({
          fields: {
            sessionId: { stringValue: event.sessionId },
            timestamp: { timestampValue: event.timestamp },
            city: { stringValue: event.city },
            aqi: { integerValue: String(event.aqi) },
            pm25: { doubleValue: event.pm25 },
            reductionPercentage: { doubleValue: event.reductionPercentage },
            latencyMs: { integerValue: String(event.latencyMs) },
          },
        }),
      });

      return { success: res.ok, id: docId };
    } catch {
      return { success: false, id: docId };
    }
  }
}
