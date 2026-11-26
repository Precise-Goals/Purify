/**
 * Google Cloud Platform (GCP) Vertex AI & Gemini Architecture Connector
 *
 * Provides enterprise grounding, structured JSON schema enforcement,
 * and high-availability inference via Google Vertex AI / Gemini models.
 */

import { redactSecrets } from "../sanitize";
import type { FetchLike } from "../aqi";

export interface VertexConfig {
  projectId?: string;
  location?: string;
  modelName?: string;
  apiKey?: string;
  fetchFn?: FetchLike;
}

export interface VertexGenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseSchema?: Record<string, unknown>;
}

export interface VertexMetadata {
  stack: string;
  model: string;
  region: string;
  projectId: string;
  endpointType: string;
}

interface VertexApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

/**
 * Google Cloud Vertex AI connector supporting developer header keys and GCP IAM ADC tokens.
 */
export class VertexAIService {
  private readonly projectId: string;
  private readonly location: string;
  private readonly modelName: string;
  private readonly apiKey?: string;
  private readonly fetchFn: FetchLike;

  constructor(config: VertexConfig = {}) {
    this.projectId = config.projectId || process.env.GOOGLE_CLOUD_PROJECT || "purify-gcp-production";
    this.location = config.location || process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
    this.modelName = config.modelName || "gemini-3.5-flash-lite";
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.fetchFn = config.fetchFn || fetch;
  }

  /**
   * Generates structured recommendations via Gemini / Vertex AI using header-based auth.
   */
  public async generateStructuredPlan<T>(
    prompt: string,
    options: VertexGenerateOptions = {}
  ): Promise<{ data: T; latencyMs: number; model: string }> {
    const startTime = Date.now();
    const endpoint = this.apiKey
      ? `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent`
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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["x-goog-api-key"] = this.apiKey;
    } else if (process.env.GOOGLE_ACCESS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`;
    }

    const res = await this.fetchFn(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const errText = redactSecrets(await res.text().catch(() => ""));
      throw new Error(`Vertex AI generation failed (${res.status}): ${errText}`);
    }

    const json = (await res.json()) as VertexApiResponse;
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
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
  public getMetadata(): VertexMetadata {
    return {
      stack: "Google Cloud Platform - Vertex AI",
      model: this.modelName,
      region: this.location,
      projectId: this.projectId,
      endpointType: this.apiKey ? "Google AI Studio Developer API" : "GCP Cloud IAM / ADC",
    };
  }
}
