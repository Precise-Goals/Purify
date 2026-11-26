import type { NextResponse } from "next/server";
import { handlePlanRequest } from "@/lib/plan-handler";

/**
 * Next.js App Router POST endpoint handler.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handlePlanRequest(request);
}
