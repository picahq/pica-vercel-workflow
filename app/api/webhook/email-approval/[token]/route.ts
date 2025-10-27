/**
 * API Route: Email Approval Webhook Handler
 * POST /api/webhook/email-approval/[token]
 * 
 * This endpoint receives email approval decisions and resumes the workflow
 */

import { resumeWebhook } from "workflow/api";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    console.log(`📋 Email approval webhook received for token: ${token}`);

    // Parse the approval decision
    const body = await request.json();
    
    const approved = body.approved === true;
    
    console.log(`Decision: ${approved ? "Approved ✅" : "Rejected ❌"}`);

    // Resume the workflow with the approval decision
    const result = await resumeWebhook(token, {
      approved,
      timestamp: new Date().toISOString(),
      ...body,
    });

    if (result) {
      console.log(`✅ Workflow resumed`);
      
      return NextResponse.json({
        success: true,
        message: approved ? "Email approved - workflow will send email" : "Email rejected - workflow will skip sending",
      });
    } else {
      console.warn(`⚠️ No workflow found for token: ${token}`);
      
      return NextResponse.json(
        { error: "No workflow found for this token" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("❌ Error handling email approval webhook:", error);
    
    return NextResponse.json(
      {
        error: "Failed to process email approval",
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
    message: "Email approval webhook endpoint",
    token: token,
    usage: "POST to this endpoint with { approved: boolean }",
  });
}

