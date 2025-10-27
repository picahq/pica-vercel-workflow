/**
 * API Route: Receive step completion updates from workflow
 * POST /api/step-update
 * 
 * Workflow steps call this to report their results in real-time
 */

import { NextResponse } from "next/server";

// In-memory store for step results
const stepResults = new Map<string, any>();
const workflowTimestamps = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { runId, stepId, stepName, status, result } = body;

    if (!runId || !stepId) {
      return NextResponse.json({ error: "Missing runId or stepId" }, { status: 400 });
    }

    const key = `${runId}:${stepId}`;
    
    // Update timestamp for this workflow
    workflowTimestamps.set(runId, Date.now());
    
    stepResults.set(key, {
      stepId,
      stepName,
      status,
      result,
      timestamp: new Date().toISOString(),
    });

    console.log(`📝 Step update: ${runId} - ${stepName} = ${status}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing step result:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get("runId");
    const clear = searchParams.get("clear");

    if (!runId) {
      return NextResponse.json({ error: "Missing runId" }, { status: 400 });
    }

    // Clear old data if requested
    if (clear === "true") {
      const keysToDelete: string[] = [];
      stepResults.forEach((value, key) => {
        if (key.startsWith(`${runId}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => stepResults.delete(key));
      workflowTimestamps.delete(runId);
      return NextResponse.json({ success: true, cleared: keysToDelete.length });
    }

    // Get all steps for this workflow
    const steps: any[] = [];
    stepResults.forEach((value, key) => {
      if (key.startsWith(`${runId}:`)) {
        steps.push(value);
      }
    });

    // Add metadata
    const lastUpdate = workflowTimestamps.get(runId);

    return NextResponse.json({ 
      success: true, 
      steps,
      count: steps.length,
      lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

