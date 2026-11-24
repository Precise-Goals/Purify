import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "breathewise",
      app: "purify",
      name: "Purify Clean Air Intelligence",
      gcpStack: "Google Cloud Run + Vertex AI + Google Maps Air Quality API",
      version: "0.2.0",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
