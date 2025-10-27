/**
 * API Route: Start Lead Enrichment Workflow
 * POST /api/leads
 */

import { start } from "workflow/api";
import { NextResponse } from "next/server";
import { enrichLeadWorkflow, type LeadData } from "@/workflows/lead-enrichment";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const { name, email, company } = body as LeadData;
    
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, company" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting workflow for lead: ${name} (${email}) at ${company}`);

    // Start the workflow - it will call REAL Pica APIs and return results
    const { runId } = await start(enrichLeadWorkflow, [
      { name, email, company },
    ]);

    console.log(`✅ Workflow started with runId: ${runId}`);
    console.log(`📊 Query workflow result at: GET /api/workflow/${runId}`);

    return NextResponse.json({
      success: true,
      message: "Lead enrichment workflow started",
      runId,
      lead: { name, email, company },
    });
  } catch (error) {
    console.error("❌ Error starting workflow:", error);
    
    return NextResponse.json(
      {
        error: "Failed to start workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    service: "Lead Enrichment API",
    version: "1.0.0",
    endpoints: {
      POST: "/api/leads - Start lead enrichment workflow",
    },
  });
}

