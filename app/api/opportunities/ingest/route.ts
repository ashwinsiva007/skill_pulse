import { NextResponse } from "next/server";
import { jobIngestionEngine } from "@/lib/opportunities/ingestion-service";

export async function POST(request: Request) {
  const configuredSecret = process.env.OPPORTUNITY_INGEST_SECRET;

  // If a secret is configured in the environment, enforce authorization
  if (configuredSecret) {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get("secret");
    const token = authHeader?.replace("Bearer ", "") || querySecret;

    if (token !== configuredSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized ingestion trigger" },
        { status: 401 }
      );
    }
  }

  try {
    const startTime = Date.now();
    const result = await jobIngestionEngine.getOpportunities({}, true);
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "Ingestion pipeline executed successfully",
      durationMs,
      totalLiveCount: result.totalLiveCount,
      totalCuratedCount: result.totalCuratedCount,
      totalCount: result.opportunities.length,
      providerStatuses: result.providerStatuses,
      timestamp: result.lastIngestionTimestamp,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Ingestion failed",
        message: err?.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Return provider health status
  const statuses = await jobIngestionEngine.getProvidersHealth();
  return NextResponse.json({
    success: true,
    providers: statuses,
    timestamp: new Date().toISOString(),
  });
}
