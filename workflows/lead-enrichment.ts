/**
 * AI-Powered Lead Enrichment Workflow
 * 
 * This workflow calls REAL Pica APIs and returns all responses.
 * Frontend uses getRun() to query the result and display real data.
 */

import { getWorkflowMetadata, getStepMetadata, fetch, sleep } from "workflow";
import {
  exaSearch,
  attioCreatePerson,
  attioSearchPeople,
  airtableCreateRecord,
  gmailSendEmail,
  notionCreatePage,
} from "@/lib/pica-client";

export interface LeadData {
  name: string;
  email: string;
  company: string;
}

export interface CompanyResearch {
  funding?: string;
  techStack?: string[];
  recentNews?: string[];
  competitors?: string[];
  size?: string;
  industry?: string;
}

export interface DecisionMaker {
  name: string;
  title: string;
  linkedinUrl?: string;
}

/**
 * Main workflow function
 */
export async function enrichLeadWorkflow(leadData: LeadData) {
  "use workflow";

  console.log(`🚀 Starting lead enrichment for: ${leadData.name} at ${leadData.company}`);
  
  // Get the REAL runId using getWorkflowMetadata()!
  const workflowMeta = getWorkflowMetadata();
  const runId = (workflowMeta as any).runId || "unknown";
  
  console.log(`📊 Workflow runId from metadata: ${runId}`);

  // Step 1: Research company with Exa (REAL PICA API)
  const companyData = await researchCompany(leadData.company, runId);
  await sleep("2s"); // Pause for visualization

  // Step 2: Find decision makers with Exa (REAL PICA API)
  const decisionMakers = await findDecisionMakers(leadData.company, runId);
  await sleep("2s"); // Pause for visualization

  // Step 3: Create enriched contact in Attio CRM (REAL PICA API)
  const attioResult = await createAttioContact(leadData, companyData, runId);
  await sleep("2s"); // Pause for visualization

  // Step 4: Log to Airtable for analytics (REAL PICA API)
  const airtableResult = await logToAirtable(leadData, companyData, decisionMakers, runId);
  await sleep("2s"); // Pause for visualization

  // Step 5: Generate personalized email
  const emailContent = await generatePersonalizedEmail(leadData, companyData, runId);
  await sleep("2s"); // Pause for visualization

  // Step 6: Send email via Gmail (REAL PICA API - AUTOMATIC, NO APPROVAL)
  console.log("📧 Sending email automatically...");
  const gmailResult = await sendInitialEmail(leadData.email, emailContent);
  console.log("✅ Gmail result:", gmailResult);
  await reportStepResult(runId, "gmail", "Send Email", "completed", gmailResult);
  await sleep("2s"); // Pause for visualization

  // Step 7: Create Notion intelligence report (REAL PICA API) - with error handling
  let notionResult = null;
  let notionStatus = "completed";
  try {
    notionResult = await createNotionReport(leadData, companyData, decisionMakers);
    console.log("✅ Notion report created:", notionResult);
  } catch (error: any) {
    console.log("⚠️ Notion failed:", error.message);
    notionResult = { error: error.message, failed: true };
    notionStatus = "failed";
  }
  await reportStepResult(runId, "notion", "Notion Report", notionStatus, notionResult);

  console.log("✅ Lead enrichment workflow complete!");

  // Return ALL real Pica responses - frontend uses getRun() to access this!
  return {
    success: true,
    leadData,
    companyData,           // REAL Exa response
    decisionMakers,        // REAL Exa response
    attioResult,          // REAL Attio response
    airtableResult,       // REAL Airtable response
    emailContent,         // Generated email
    gmailResult,          // REAL Gmail response
    notionResult,         // REAL Notion response
    emailSent: true,      // Always sent now
  };
}

/**
 * Helper: Report step result to API for real-time UI updates
 */
async function reportStepResult(runId: string, stepId: string, stepName: string, status: string, result: any) {
  try {
    // Use VERCEL_URL in production, localhost in dev
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `http://localhost:${process.env.PORT || 3000}`;
    
    const url = `${baseUrl}/api/step-update`;
    console.log(`📡 Reporting ${stepName} to: ${url}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, stepId, stepName, status, result }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    console.log(`✅ Reported ${stepName} result to UI`);
  } catch (error: any) {
    console.log(`⚠️ Could not report step result (non-critical):`, error.message || error);
  }
}

/**
 * Step 1: Research company using Exa
 */
async function researchCompany(companyName: string, runId: string): Promise<CompanyResearch> {
  "use step";

  console.log(`🔍 Step 1: Researching ${companyName} with Exa...`);
  
  // Get stepId from metadata
  const stepMeta = getStepMetadata();

  try {
    // REAL PICA API CALL
    const companyInfo = await exaSearch(
      `${companyName} company funding tech stack recent news size employees`,
      {
        numResults: 5,
        type: "neural",
        contents: {
          text: { maxCharacters: 2000 },
        },
      }
    );

    const research: CompanyResearch = {
      funding: extractFunding(companyInfo),
      techStack: extractTechStack(companyInfo),
      recentNews: extractNews(companyInfo),
      size: extractCompanySize(companyInfo),
      industry: extractIndustry(companyInfo),
    };

    console.log(`✅ Company research complete:`, research);
    
    // Report to API for real-time UI update!
    await reportStepResult(runId, "research", "Company Research", "completed", research);
    
    return research;
  } catch (error) {
    console.error(`❌ Error researching company:`, error);
    await reportStepResult(runId, "research", "Company Research", "failed", { error: "Failed to research company" });
    return {
      funding: "",
      techStack: [],
      recentNews: [],
      size: "",
      industry: "",
    };
  }
}

/**
 * Step 2: Find decision makers using Exa
 */
async function findDecisionMakers(companyName: string, runId: string): Promise<DecisionMaker[]> {
  "use step";

  console.log(`👥 Step 2: Finding decision makers at ${companyName}...`);

  try {
    // REAL PICA API CALL
    const linkedinResults = await exaSearch(
      `${companyName} CEO CTO VP Sales Head of Marketing LinkedIn profile`,
      {
        numResults: 5,
        type: "neural",
        category: "linkedin profile",
        contents: {
          text: { maxCharacters: 500 },
        },
      }
    );

    const decisionMakers: DecisionMaker[] = linkedinResults.results
      ?.slice(0, 3)
      .map((result: any) => ({
        name: extractNameFromLinkedIn(result),
        title: extractTitleFromLinkedIn(result),
        linkedinUrl: result.url,
      })) || [];

    console.log(`✅ Found ${decisionMakers.length} decision makers:`, decisionMakers);
    
    // Report to API
    await reportStepResult(runId, "decision_makers", "Decision Makers", "completed", { executives: decisionMakers });
    
    return decisionMakers;
  } catch (error) {
    console.error(`❌ Error finding decision makers:`, error);
    await reportStepResult(runId, "decision_makers", "Decision Makers", "failed", { error: "Failed to find decision makers" });
    return [];
  }
}

/**
 * Step 3: Create enriched contact in Attio CRM
 */
async function createAttioContact(
  leadData: LeadData,
  companyData: CompanyResearch,
  runId: string
) {
  "use step";

  console.log(`📝 Step 3: Creating contact in Attio CRM...`);

  try {
    // STEP 1: Search for existing contacts with this email
    console.log(`🔍 Searching for existing contacts with email: ${leadData.email}`);
    const searchResult = await attioSearchPeople(leadData.email);
    const existingContacts = searchResult.data || [];
    
    console.log(`📊 Found ${existingContacts.length} existing contact(s) with this email`);
    
    // STEP 2: Check if ANY of them have the same name AND company
    const [firstName, ...lastNameParts] = leadData.name.split(" ");
    const lastName = lastNameParts.join(" ") || "Unknown";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const company = leadData.company.toLowerCase();
    
    const exactMatch = existingContacts.find((contact: any) => {
      const contactName = contact.values?.name?.[0]?.full_name?.toLowerCase() || "";
      const contactCompany = contact.values?.primary_location?.[0]?.company_name?.toLowerCase() || "";
      
      const nameMatches = contactName === fullName;
      const companyMatches = contactCompany === company;
      
      return nameMatches && companyMatches;
    });
    
    if (exactMatch) {
      console.log(`⚠️ Exact match found! Same email + name + company already exists`);
      const skipData = { 
        skipped: true, 
        reason: `Duplicate: ${leadData.name} (${leadData.email}) at ${leadData.company} already exists`,
        recordId: exactMatch.id?.record_id
      };
      await reportStepResult(runId, "attio", "Attio CRM", "completed", skipData);
      return { data: skipData };
    }
    
    // STEP 3: No exact match found - create new contact
    console.log(`✅ No exact match - creating new contact`);
    // Build description with only available data
    const descParts = [`Lead from ${leadData.company}`];
    if (companyData.funding) descParts.push(`Funding: ${companyData.funding}`);
    if (companyData.size) descParts.push(`Size: ${companyData.size}`);
    if (companyData.techStack?.length) descParts.push(`Tech: ${companyData.techStack.join(", ")}`);
    const description = descParts.join(". ") + ".";

    const result = await attioCreatePerson({
      firstName,
      lastName,
      email: leadData.email,
      description,
      company: leadData.company,
    });

    console.log(`✅ Created Attio contact:`, result.data?.id);
    await reportStepResult(runId, "attio", "Attio CRM", "completed", result.data);
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // FALLBACK: If creation fails with uniqueness_conflict, the search might have missed it
    // This means a contact with this email exists (Attio enforces email uniqueness)
    // Treat as duplicate and skip
    if (errorMessage.includes("uniqueness_conflict")) {
      console.log(`⚠️ Uniqueness conflict during creation - email already exists in Attio`);
      const skipData = { 
        skipped: true, 
        reason: `Contact with email ${leadData.email} already exists in Attio (enforced by Attio)`,
        note: "Email uniqueness enforced by Attio - same email cannot have multiple records"
      };
      await reportStepResult(runId, "attio", "Attio CRM", "completed", skipData);
      return { data: skipData };
    }
    
    console.error(`❌ Error in Attio step:`, error);
    await reportStepResult(runId, "attio", "Attio CRM", "failed", { error: errorMessage });
    throw error;
  }
}

/**
 * Step 4: Log to Airtable for analytics
 */
async function logToAirtable(
  leadData: LeadData,
  companyData: CompanyResearch,
  decisionMakers: DecisionMaker[],
  runId: string
) {
  "use step";

  console.log(`📊 Step 4: Logging to Airtable...`);

  try {
    // REAL PICA API CALL
    const result = await airtableCreateRecord({
      Name: leadData.name,
      Email: leadData.email,
      Company: leadData.company,
      Funding: companyData.funding || "Not available",
      "Tech Stack": companyData.techStack?.join(", ") || "Not available",
      "Company Size": companyData.size || "Not available",
      Industry: companyData.industry || "Technology",
      "Decision Makers": decisionMakers.map((dm) => dm.name).join(", "),
      "Enriched At": new Date().toISOString(),
      Status: "Enriched",
    });

    console.log(`✅ Logged to Airtable:`, result.id);
    
    // Report to API
    await reportStepResult(runId, "airtable", "Airtable", "completed", result);
    
    return result;
  } catch (error) {
    console.error(`❌ Error logging to Airtable:`, error);
    await reportStepResult(runId, "airtable", "Airtable", "failed", { error: "Failed to log to Airtable" });
  }
}

/**
 * Step 5: Generate personalized email
 */
async function generatePersonalizedEmail(
  leadData: LeadData,
  companyData: CompanyResearch,
  runId: string
): Promise<{ subject: string; body: string }> {
  "use step";

  console.log(`✉️ Step 5: Generating personalized email...`);

  const firstName = leadData.name.split(" ")[0];
  const subject = `Quick question about ${leadData.company}`;

  // Build email body with natural fallbacks
  let intro = `Hi ${firstName},\n\nI came across ${leadData.company}`;
  
  if (companyData.recentNews?.length) {
    intro += ` and was impressed by your recent momentum`;
  } else {
    intro += ` and wanted to reach out`;
  }
  intro += `.`;

  // Add tech stack mention if available
  let techMention = "";
  if (companyData.techStack && companyData.techStack.length >= 2) {
    techMention = `\n\nI noticed you're working with ${companyData.techStack.slice(0, 2).join(" and ")}—that's a great stack.`;
  } else if (companyData.techStack && companyData.techStack.length === 1) {
    techMention = `\n\nI see you're using ${companyData.techStack[0]} in your tech stack.`;
  }

  // Add funding mention if available
  let fundingMention = "";
  if (companyData.funding) {
    fundingMention = ` Congrats on your recent ${companyData.funding} funding!`;
  }

  const body = `${intro}${techMention}

${fundingMention ? fundingMention + "\n\n" : ""}I'd love to learn more about what you're building and explore if there's a way we could work together.

Would you be open to a quick 15-minute call next week?

Best regards,
Sales Team`;

  console.log(`✅ Email generated`);
  
  // Report to API
  await reportStepResult(runId, "email_gen", "Generate Email", "completed", { subject, body, to: leadData.email });
  
  return { subject, body };
}

/**
 * Step 7: Send initial email via Gmail (only if approved)
 */
async function sendInitialEmail(
  recipientEmail: string,
  emailContent: { subject: string; body: string }
) {
  "use step";

  console.log(`📧 Step 7: Sending email to ${recipientEmail}...`);

  try {
    // REAL PICA API CALL
    const result = await gmailSendEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      body: emailContent.body,
      isHtml: false,
    });

    console.log(`✅ Email sent:`, result.email?.messageId);
    return result;
  } catch (error) {
    console.error(`❌ Error sending email:`, error);
    throw error;
  }
}

/**
 * Step 9: Create Notion intelligence report
 */
async function createNotionReport(
  leadData: LeadData,
  companyData: CompanyResearch,
  decisionMakers: DecisionMaker[]
) {
  "use step";

  console.log(`📝 Step 9: Creating Notion report...`);

  try {
    const content = `
Lead: ${leadData.name}
Email: ${leadData.email}
Company: ${leadData.company}

Company Research:
- Funding: ${companyData.funding}
- Size: ${companyData.size}
- Industry: ${companyData.industry}
- Tech Stack: ${companyData.techStack?.join(", ")}
- Recent News: ${companyData.recentNews?.join("; ")}

Decision Makers:
${decisionMakers.map((dm) => `- ${dm.name} (${dm.title})`).join("\n")}

Enriched: ${new Date().toISOString()}
    `;

    // REAL PICA API CALL
    const result = await notionCreatePage({
      title: `Lead: ${leadData.name} - ${leadData.company}`,
      content,
    });

    console.log(`✅ Notion report created:`, result.id);
    return result;
  } catch (error) {
    console.error(`❌ Error creating Notion report:`, error);
    throw error; // Re-throw so the workflow can catch it
  }
}

/**
 * Handle interested lead
 */
async function handleInterestedLead(leadData: LeadData) {
  "use step";

  console.log(`🎉 Lead is interested! Sending follow-up...`);

  await gmailSendEmail({
    to: leadData.email,
    subject: "Great to hear from you!",
    body: `Thanks for your interest! Let's schedule that call. Here's my calendar link...`,
    isHtml: false,
  });
}

/**
 * Handle not interested lead
 */
async function handleNotInterestedLead(leadData: LeadData) {
  "use step";

  console.log(`📋 Lead not interested. Adding to nurture sequence...`);
  console.log(`Added ${leadData.email} to long-term nurture`);
}

// Helper functions to extract data from Exa results
function extractFunding(results: any): string {
  const text = results.results?.[0]?.text || "";
  const fundingMatch = text.match(/\$([\d.]+[MBK])/);
  return fundingMatch ? fundingMatch[0] : "";
}

function extractTechStack(results: any): string[] {
  const text = results.results?.map((r: any) => r.text).join(" ") || "";
  const techKeywords = [
    "React",
    "Node.js",
    "Python",
    "AWS",
    "TypeScript",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "Kubernetes",
  ];
  return techKeywords.filter((tech) => text.includes(tech));
}

function extractNews(results: any): string[] {
  return (
    results.results
      ?.slice(0, 2)
      .map((r: any) => r.title)
      .filter(Boolean) || []
  );
}

function extractCompanySize(results: any): string {
  const text = results.results?.[0]?.text || "";
  const sizeMatch = text.match(/(\d+[\d,]*)\s*(employees|people)/i);
  return sizeMatch ? `${sizeMatch[1]} employees` : "";
}

function extractIndustry(results: any): string {
  return "Technology";
}

function extractNameFromLinkedIn(result: any): string {
  return result.title?.split("|")[0]?.trim() || "Unknown";
}

function extractTitleFromLinkedIn(result: any): string {
  const parts = result.title?.split("|");
  return parts?.[1]?.trim() || "Executive";
}

