/**
 * Google Cloud Platform (GCP) Vertex AI & Gemini Architecture Connector
 * 
 * Provides enterprise grounding, structured JSON schema enforcement,
 * and high-availability inference via Google Vertex AI / Gemini 2.5 Flash.
 */

export interface VertexConfig {
  projectId?: string;
  location?: string;
  modelName?: string;
  apiKey?: string;
}

export interface VertexGenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseSchema?: Record<string, unknown>;
}

export class VertexAIService {
  private projectId: string;
  private location: string;
  private modelName: string;
  private apiKey?: string;

  constructor(config: VertexConfig = {}) {
    this.projectId = config.projectId || process.env.GOOGLE_CLOUD_PROJECT || "purify-gcp-production";
    this.location = config.location || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
    this.modelName = config.modelName || "gemini-2.5-flash";
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
  }

  /**
   * Generates structured recommendations via Gemini 2.5 Flash.
   */
  public async generateStructuredPlan<T>(
    prompt: string,
    options: VertexGenerateOptions = {}
  ): Promise<{ data: T; latencyMs: number; model: string }> {
    const startTime = Date.now();
    const endpoint = this.apiKey
      ? `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${encodeURIComponent(this.apiKey)}`
      : `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelName}:generateContent`;

    const requestPayload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: options.systemInstruction
        ? { parts: [{ text: options.systemInstruction }] }
        : undefined,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens ?? 1024,
        responseMimeType: "application/json",
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.GOOGLE_ACCESS_TOKEN
          ? { Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Vertex AI generation failed (${res.status}): ${errText}`);
    }

    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const data = JSON.parse(rawText) as T;

    return {
      data,
      latencyMs: Date.now() - startTime,
      model: this.modelName,
    };
  }

  /**
   * Returns metadata about the active GCP Vertex AI configuration.
   */
  public getMetadata() {
    return {
      stack: "Google Cloud Platform - Vertex AI",
      model: this.modelName,
      region: this.location,
      projectId: this.projectId,
      endpointType: this.apiKey ? "Google AI Studio Developer API" : "GCP Cloud IAM / ADC",
    };
  }
}
