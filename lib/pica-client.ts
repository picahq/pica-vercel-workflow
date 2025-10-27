/**
 * Pica API Client
 * Helper functions to call Pica passthrough APIs
 */

const PICA_BASE_URL = "https://api.picaos.com/v1/passthrough";

interface PicaRequestOptions {
  actionId: string;
  connectionKey: string;
  path: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: any;
  queryParams?: Record<string, any>;
  pathVariables?: Record<string, any>;
}

/**
 * Make a request to Pica passthrough API
 */
export async function picaRequest(options: PicaRequestOptions) {
  const {
    actionId,
    connectionKey,
    path,
    method = "POST",
    body,
    queryParams,
    pathVariables,
  } = options;

  const picaSecret = process.env.PICA_SECRET;
  if (!picaSecret) {
    throw new Error("PICA_SECRET environment variable is not set");
  }

  const url = `${PICA_BASE_URL}/${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-pica-secret": picaSecret,
    "x-pica-connection-key": connectionKey,
    "x-pica-action-id": actionId,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  console.log(`[Pica] ${method} ${url}`);

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pica API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

/**
 * Search with Exa
 */
export async function exaSearch(query: string, options?: {
  numResults?: number;
  type?: "keyword" | "neural" | "fast" | "auto";
  category?: string;
  contents?: any;
}) {
  const connectionKey = process.env.PICA_EXA_CONNECTION_KEY;
  const actionId = "conn_mod_def::GCMYluPusxk::qRcN1EboSxi3a1kDq_mFdg"; // Hardcoded Exa Search action ID

  if (!connectionKey) {
    throw new Error("Exa connection key not configured");
  }

  return await picaRequest({
    actionId,
    connectionKey,
    path: "search",
    method: "POST",
    body: {
      query,
      numResults: options?.numResults || 10,
      type: options?.type || "auto",
      category: options?.category,
      contents: options?.contents || {
        text: { maxCharacters: 1000 }
      }
    },
  });
}

/**
 * Create person in Attio CRM
 */
/**
 * Search for people in Attio by email
 */
export async function attioSearchPeople(email: string) {
  const connectionKey = process.env.PICA_ATTIO_CONNECTION_KEY;
  const actionId = "conn_mod_def::F-w-nUqoSmA::-FyRzQ8yRhSKwp98dR2kQA"; // List Person Records

  if (!connectionKey) {
    throw new Error("Attio connection key not configured");
  }

  return await picaRequest({
    actionId,
    connectionKey,
    path: "objects/people/records/query",
    method: "POST",
    body: {
      filter: {
        email_addresses: { "$contains": email }
      },
      limit: 10
    },
  });
}

export async function attioCreatePerson(data: {
  firstName: string;
  lastName: string;
  email?: string; // Optional now
  description?: string;
  company?: string;
}) {
  const connectionKey = process.env.PICA_ATTIO_CONNECTION_KEY;
  const actionId = "conn_mod_def::F-w-tqv1Abo::PogfBnxcTW2DD51Ip5h9hA"; // Hardcoded Attio Create Person action ID

  if (!connectionKey) {
    throw new Error("Attio connection key not configured");
  }

  return await picaRequest({
    actionId,
    connectionKey,
    path: "objects/people/records",
    method: "POST",
    body: {
      data: {
        values: {
          name: [
            {
              first_name: data.firstName,
              last_name: data.lastName,
              full_name: `${data.firstName} ${data.lastName}`,
            },
          ],
          // Only include email if provided
          ...(data.email && {
            email_addresses: [
              {
                email_address: data.email,
              },
            ],
          }),
          ...(data.description && {
            description: [{ value: data.description }],
          }),
        },
      },
    },
  });
}

/**
 * Create record in Airtable
 */
export async function airtableCreateRecord(fields: Record<string, any>) {
  const connectionKey = process.env.PICA_AIRTABLE_CONNECTION_KEY;
  const actionId = "conn_mod_def::F--Ywa8nfKA::WsZ0tL8uSD-23rubqhbfPQ"; // Hardcoded Airtable Create Record action ID
  const databaseId = process.env.AIRTABLE_DATABASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;

  if (!connectionKey || !databaseId || !tableId) {
    throw new Error("Airtable configuration not complete");
  }

  const response = await picaRequest({
    actionId,
    connectionKey,
    path: `${databaseId}/${tableId}`,
    method: "POST",
    body: {
      fields,
    },
  });

  // Airtable returns { id, createdTime, fields }
  return {
    id: response.id,
    recordId: response.id, // For backwards compatibility
    createdTime: response.createdTime,
    fields: response.fields,
  };
}

/**
 * Send email via Gmail
 */
export async function gmailSendEmail(data: {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}) {
  const connectionKey = process.env.PICA_GMAIL_CONNECTION_KEY;
  const actionId = "conn_mod_def::GGXAjWkZO8U::uMc1LQIHTTKzeMm3rLL5gQ"; // Hardcoded Gmail Send Email action ID

  if (!connectionKey) {
    throw new Error("Gmail connection key not configured");
  }

  return await picaRequest({
    actionId,
    connectionKey,
    path: "gmail/send-email",
    method: "POST",
    body: {
      connectionKey, // Gmail API expects this in body
      to: data.to,
      subject: data.subject,
      body: data.body,
      isHtml: data.isHtml || false,
    },
  });
}

/**
 * Create page in Notion
 */
export async function notionCreatePage(data: {
  title: string;
  content?: string;
  properties?: any;
}) {
  const connectionKey = process.env.PICA_NOTION_CONNECTION_KEY;
  const actionId = "conn_mod_def::GCWcIDJuR4A::izAAbGNdQdKddzdP_JS4kw"; // Hardcoded Notion Create Page action ID
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

  if (!connectionKey || !parentPageId) {
    throw new Error("Notion configuration not complete");
  }

  return await picaRequest({
    actionId,
    connectionKey,
    path: "v1/pages",
    method: "POST",
    body: {
      parent: {
        page_id: parentPageId,
      },
      properties: {
        title: [
          {
            text: {
              content: data.title,
            },
          },
        ],
        ...(data.properties || {}),
      },
      ...(data.content && {
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: data.content,
                  },
                },
              ],
            },
          },
        ],
      }),
    },
  });
}

