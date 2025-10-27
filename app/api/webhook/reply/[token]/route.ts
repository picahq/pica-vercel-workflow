/**
 * API Route: Email Reply Webhook Handler
 * POST /api/webhook/reply/[token]
 * 
 * This endpoint receives email reply notifications and resumes the workflow
 */

import { resumeWebhook } from "workflow/api";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    console.log(`📧 Webhook received for token: ${token}`);

    // Parse the reply data
    const body = await request.json();
    
    // In a real app, you'd parse the email content to determine interest
    // For demo, we'll accept a simple payload
    const interested = body.interested !== false; // Default to interested
    
    console.log(`Reply status: ${interested ? "Interested" : "Not interested"}`);

    // Resume the workflow with the reply data
    const result = await resumeWebhook(token, {
      interested,
      timestamp: new Date().toISOString(),
      ...body,
    });

    if (result) {
      console.log(`✅ Workflow resumed`);
      
      return NextResponse.json({
        success: true,
        message: "Workflow resumed with reply",
      });
    } else {
      console.warn(`⚠️ No workflow found for token: ${token}`);
      
      return NextResponse.json(
        { error: "No workflow found for this token" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for testing
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  return NextResponse.json({
    message: "Email reply webhook endpoint",
    token: token,
    usage: "POST to this endpoint with { interested: boolean }",
  });
}

