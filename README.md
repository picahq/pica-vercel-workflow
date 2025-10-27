# Pica + Vercel Workflows - Lead Enrichment Pipeline

An automated B2B lead intelligence system that enriches sales leads through AI-powered research, CRM integration, and personalized outreach—all visualized in real-time.

## What It Does

Automates the entire lead enrichment process:
1. **Company Research** - Deep AI search for funding, tech stack, and news (via Exa)
2. **Decision Makers** - Finds key executives and LinkedIn profiles (via Exa)
3. **CRM Integration** - Creates enriched contacts in Attio with duplicate detection
4. **Analytics Logging** - Tracks all enrichment data in Airtable
5. **Email Generation** - AI-powered personalized outreach emails
6. **Automated Sending** - Sends emails via Gmail
7. **Intelligence Reports** - Creates detailed reports in Notion

## Tech Stack

- **Vercel Workflows** - Durable workflow orchestration
- **Pica** - Unified API for 5+ integrations (Exa, Attio, Airtable, Gmail, Notion)
- **Next.js 15** - React framework with App Router
- **React Flow** - Visual workflow canvas
- **Tailwind CSS + shadcn/ui** - Modern UI components

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```bash
# Pica API Configuration
PICA_SECRET=your_pica_secret_key

# Integration Connection Keys (from Pica dashboard)
PICA_EXA_CONNECTION_KEY=live::exa::default::your_exa_key
PICA_ATTIO_CONNECTION_KEY=live::attio::default::your_attio_key
PICA_AIRTABLE_CONNECTION_KEY=live::airtable::default::your_airtable_key
PICA_GMAIL_CONNECTION_KEY=live::gmail::default::your_gmail_key
PICA_NOTION_CONNECTION_KEY=live::notion::default::your_notion_key

# Airtable Configuration
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_ID=tblXXXXXXXXXXXXXX

# Notion Configuration
NOTION_PARENT_PAGE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. Get Your Pica Credentials

1. Sign up at [pica.com](https://pica.com)
2. Connect your integrations (Exa, Attio, Airtable, Gmail, Notion)
3. Copy connection keys from the Pica dashboard
4. Set your `PICA_SECRET` from account settings

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### Workflow Execution

```typescript
// workflows/lead-enrichment.ts
export async function enrichLeadWorkflow(leadData: LeadData) {
  "use workflow"; // Vercel Workflow directive
  
  // Each step calls real Pica APIs
  const companyData = await researchCompany();      // Step 1
  const decisionMakers = await findDecisionMakers(); // Step 2
  const attioResult = await createAttioContact();   // Step 3
  // ... etc
  
  return { success: true, /* all results */ };
}
```

### Real-Time Updates

- Workflow pushes step results to `/api/step-update` using `fetch` from "workflow"
- Frontend polls every 2 seconds
- React Flow visualizes progress with 8 stable nodes
- No disappearing nodes - memoized `nodeTypes` and `edgeTypes`

### Key Features

✅ **Combo Uniqueness** - Searches Attio for email+name+company before creating duplicates  
✅ **Error Handling** - Failed steps show red badge with error details  
✅ **Real-Time Visualization** - See each step complete with 2-second pauses  
✅ **Durable Execution** - Survives server restarts, auto-retries on failures  
✅ **Production Ready** - Bulletproof state management, no flickering nodes  

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── leads/           # Trigger workflow endpoint
│   │   ├── workflow/        # Query workflow status
│   │   └── step-update/     # Real-time step data store
│   ├── workflow/[runId]/    # Workflow visualization page
│   └── page.tsx             # Landing page with form
├── workflows/
│   └── lead-enrichment.ts   # Main workflow definition
├── lib/
│   └── pica-client.ts       # Pica API wrapper functions
└── components/
    └── lead-form.tsx        # Lead submission form
```

## API Endpoints

### POST /api/leads
Submits a new lead and triggers the workflow.

**Request:**
```json
{
  "name": "Sarah Chen",
  "email": "sarah@startup.com",
  "company": "Tech Startup"
}
```

**Response:**
```json
{
  "success": true,
  "runId": "wrun_01K8K...",
  "lead": { /* lead data */ }
}
```

### GET /api/workflow/[runId]
Fetches workflow status and final results.

### GET /api/step-update?runId=unknown
Fetches real-time step results.

## Deployment

Deploy to Vercel with one click:

```bash
vercel deploy
```

Make sure to add all environment variables in the Vercel dashboard.

## License

MIT

## Support

For issues or questions, open a GitHub issue or contact [support@pica.com](mailto:support@pica.com)
