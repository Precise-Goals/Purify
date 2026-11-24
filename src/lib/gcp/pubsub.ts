/**
 * Google Cloud Platform (GCP) Cloud Pub/Sub Pipeline Connector
 * 
 * Emits asynchronous pipeline events (e.g. extreme hazardous smog spikes >= 300 AQI)
 * to subscriber topics for municipal alerts and downstream automated air sanitization systems.
 */

export interface SmogHazardAlertEvent {
  topic: "purify-severe-smog-alerts";
  timestamp: string;
  city: string;
  aqi: number;
  pm25: number;
  severity: "CRITICAL" | "HAZARDOUS" | "SEVERE";
  suggestedActions: string[];
}

export class PubSubPublisher {
  private projectId: string;
  private topicName: string;

  constructor(topicName = "purify-smog-events") {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || "purify-gcp-production";
    this.topicName = topicName;
  }

  /**
   * Publishes an event to a GCP Pub/Sub topic via Cloud REST API.
   */
  public async publishEvent(data: Record<string, unknown>): Promise<{ messageId: string }> {
    const payloadString = JSON.stringify(data);
    const base64Data = Buffer.from(payloadString).toString("base64");

    const endpoint = `https://pubsub.googleapis.com/v1/projects/${this.projectId}/topics/${this.topicName}:publish`;

    try {
      if (!process.env.GOOGLE_ACCESS_TOKEN) {
        // Return simulated mock message ID when deployed outside GCP IAM service account
        return { messageId: `msg_${Date.now()}_simulated` };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messages: [{ data: base64Data, attributes: { origin: "purify-pipeline", env: "production" } }],
        }),
      });

      if (!res.ok) {
        return { messageId: `msg_err_${res.status}` };
      }

      const result = await res.json();
      return { messageId: result.messageIds?.[0] || `msg_${Date.now()}` };
    } catch {
      return { messageId: `msg_${Date.now()}_fallback` };
    }
  }
}
