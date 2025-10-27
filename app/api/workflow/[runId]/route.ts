/**
 * API Route: Get Workflow Status
 * GET /api/workflow/[runId]
 * 
 * Returns real-time workflow state using Vercel Workflow's getRun API
 */

import { NextResponse } from "next/server";
import { getRun } from "workflow/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    console.log(`📊 API: Fetching workflow for runId: ${runId}`);

    // Use Vercel Workflow's official getRun API
    const run = await getRun(runId);

    if (!run) {
      console.log(`⚠️ API: Workflow not found: ${runId}`);
      return NextResponse.json(
        { 
          error: "Workflow not found",
          runId
        },
        { status: 404 }
      );
    }

    // Get the actual run data using world.runs.get()
    const world = (run as any).world;
    const runData = await world.runs.get(runId);

    if (!runData) {
      console.log(`⚠️ API: Run data not found`);
      return NextResponse.json({ error: "Run data not available" }, { status: 404 });
    }

    console.log(`✅ API: Found workflow - Status: ${runData.status}`);
    console.log(`📦 API: Run data:`, JSON.stringify(runData, null, 2).substring(0, 500));

    // Return the workflow data
    // Extract result - it might be in array format, convert to object
    let finalResult = runData.result || runData.output || runData.returnValue || null;
    
    // If it's an array (serialized object), extract first element
    if (Array.isArray(finalResult) && finalResult[0]) {
      console.log(`🔧 API: Converting array result to object`);
      finalResult = finalResult[0];
    }
    
    return NextResponse.json({
      success: true,
      runId: runData.runId,
      status: runData.status,
      result: finalResult,
      output: finalResult,
      error: runData.error || null,
      input: runData.input,
      startedAt: runData.startedAt,
      completedAt: runData.completedAt,
      workflowName: runData.workflowName,
    });
    
  } catch (error) {
    console.error("❌ Error fetching workflow:", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch workflow",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


