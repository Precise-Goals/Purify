/**
 * Google Cloud Platform (GCP) Unified Architecture Export
 * 
 * Central export for all GCP components powering the Purify Clean Air Intelligence pipeline:
 * - Vertex AI & Gemini 2.5 Flash
 * - Google Maps Air Quality API
 * - Cloud Firestore
 * - Cloud Pub/Sub
 * - Google BigQuery
 */

export * from "./vertex";
export * from "./airquality";
export * from "./firestore";
export * from "./pubsub";
export * from "./bigquery";

export interface GCPStackBlueprint {
  service: string;
  category: "Compute" | "AI & Inference" | "Environment Telemetry" | "Persistence" | "Streaming & Analytics";
  roleInPurify: string;
  status: "active" | "configured" | "available";
}

export const PURIFY_GCP_STACK: GCPStackBlueprint[] = [
  {
    service: "Google Cloud Run",
    category: "Compute",
    roleInPurify: "Fully managed serverless container runtime hosting Next.js 15, edge routes, and pipeline workers with sub-100ms cold starts.",
    status: "configured",
  },
  {
    service: "Vertex AI / Gemini 2.5 Flash",
    category: "AI & Inference",
    roleInPurify: "High-speed reasoning model evaluating household vulnerability constraints against catalog-bound intervention candidates.",
    status: "active",
  },
  {
    service: "Google Air Quality API",
    category: "Environment Telemetry",
    roleInPurify: "Real-time pollutant monitoring (PM2.5, PM10, AQI) with localized hyper-resolution sensor fusion.",
    status: "active",
  },
  {
    service: "Cloud Firestore",
    category: "Persistence",
    roleInPurify: "Anonymized session storage, token-bucket IP rate-limiting, and 10-minute AQI cache persistence.",
    status: "configured",
  },
  {
    service: "Cloud Pub/Sub",
    category: "Streaming & Analytics",
    roleInPurify: "Asynchronous dispatch for severe hazardous smog threshold events (AQI >= 300) to automated air handling subscribers.",
    status: "configured",
  },
  {
    service: "Google BigQuery",
    category: "Streaming & Analytics",
    roleInPurify: "Scalable environmental data warehouse aggregating anonymous population-level PM2.5 exposure reductions.",
    status: "configured",
  },
];
