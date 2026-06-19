import fs from "fs";
import path from "path";
import { Client as NotionClient } from "@notionhq/client";
import { google } from "googleapis";
import { resolveDataPath } from "../utils/pathHelper";

export interface NotionSyncPayload {
  date: string;
  top_themes: string[];
  weekly_pulse: string;
  identified_fee_issue: string;
  explanation_bullets: string[];
  source_links: string[];
}

export interface MCPResult {
  success: boolean;
  notionStatus: string;
  gmailStatus: string;
  notionDetails?: string;
  gmailDetails?: string;
}

// Build RFC 2822 Base64url email for Gmail API
function buildRawEmail(subject: string, body: string, to: string = "support-leads@company.com"): string {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(body).toString("base64")
  ];
  return Buffer.from(emailLines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Base64URL encoding
}

export async function executeMCPSync(
  notionPayload: NotionSyncPayload,
  emailSubject: string,
  emailBody: string
): Promise<MCPResult> {
  const notionKey = process.env.NOTION_API_KEY;
  const notionDbId = process.env.NOTION_DATABASE_ID;

  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gmailClientId = process.env.GMAIL_CLIENT_ID;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;

  const result: MCPResult = {
    success: true,
    notionStatus: "Sandbox (Mock Sim)",
    gmailStatus: "Sandbox (Mock Sim)",
  };

  // 1. Notion Sync
  if (notionKey && notionDbId) {
    try {
      console.log("MCP: Dispatching to live Notion database...");
      const notion = new NotionClient({ auth: notionKey });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const properties: any = {
        Name: {
          title: [
            {
              text: {
                content: `Weekly Product Pulse — ${notionPayload.date}`,
              },
            },
          ],
        },
        Date: {
          date: {
            start: notionPayload.date,
          },
        },
        FeeIssue: {
          rich_text: [
            {
              text: {
                content: notionPayload.identified_fee_issue,
              },
            },
          ],
        },
        TopThemes: {
          multi_select: notionPayload.top_themes.map((theme) => ({
            name: theme.substring(0, 100), // Max limit constraints
          })),
        },
      };

      const response = await notion.pages.create({
        parent: { database_id: notionDbId },
        properties,
      });

      result.notionStatus = "LIVE_SYNCED";
      result.notionDetails = `Appended page: ${response.id}`;
    } catch (error) {
      console.error("MCP: Notion Live Sync failed, falling back to Sandbox. Error:", error);
      saveNotionToSandbox(notionPayload);
      result.notionStatus = "FALLBACK_SANDBOX";
      result.notionDetails = String(error);
    }
  } else {
    // Local File Sync
    console.info("MCP: Notion credentials missing. Saving entry to local file database.");
    const savedPath = saveNotionToSandbox(notionPayload);
    result.notionDetails = `Local DB updated at: ${savedPath}`;
  }

  // 2. Gmail Sync
  if (gmailClientSecret && gmailClientId && gmailRefreshToken) {
    try {
      console.log("MCP: Connecting to Gmail API to create email draft...");
      const oauth2Client = new google.auth.OAuth2(
        gmailClientId,
        gmailClientSecret,
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({
        refresh_token: gmailRefreshToken,
      });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      
      const rawContent = buildRawEmail(emailSubject, emailBody);

      const response = await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
          message: {
            raw: rawContent,
          },
        },
      });

      result.gmailStatus = "LIVE_SYNCED";
      result.gmailDetails = `Gmail draft created: ${response.data.id}`;
    } catch (error) {
      console.error("MCP: Gmail API Draft Creation failed, falling back to Sandbox. Error:", error);
      const draftPath = saveGmailToSandbox(emailSubject, emailBody);
      result.gmailStatus = "FALLBACK_SANDBOX";
      result.gmailDetails = `Failed live draft creation, saved to: ${draftPath}. Error: ${String(error)}`;
    }
  } else {
    console.info("MCP: Gmail credentials missing. Saving email draft in Sandbox folder.");
    const savedPath = saveGmailToSandbox(emailSubject, emailBody);
    result.gmailDetails = `Draft file saved at: ${savedPath}`;
  }

  return result;
}

function saveNotionToSandbox(payload: NotionSyncPayload): string {
  const dirPath = resolveDataPath("data");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // 1. JSON database log
  const dbPath = path.join(dirPath, "notion_database.json");
  let db: NotionSyncPayload[] = [];
  if (fs.existsSync(dbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    } catch {
      db = [];
    }
  }
  db.push(payload);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");

  // 2. Append to human-readable Markdown notes log
  const logPath = path.join(dirPath, "notion_notes_log.md");
  const markdownEntry = `
## Entry Date: ${payload.date}
* **Isolated Charge Issue:** ${payload.identified_fee_issue}
* **Top Themes:** ${payload.top_themes.join(", ")}

### Weekly Product Pulse:
${payload.weekly_pulse}

### Customer-Facing Explanation:
${payload.explanation_bullets.join("\n")}

* **Official Source Links:**
  - ${payload.source_links[0]}
  - ${payload.source_links[1]}

---
`;
  fs.appendFileSync(logPath, markdownEntry, "utf8");
  return dbPath;
}

function saveGmailToSandbox(subject: string, body: string): string {
  const dirPath = resolveDataPath("data/gmail_drafts");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const cleanSubject = subject.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 30);
  const fileName = `draft-${cleanSubject}-${Date.now()}.txt`;
  const filePath = path.join(dirPath, fileName);

  const fileContent = `Subject: ${subject}
To: support-leads@company.com
Date: ${new Date().toUTCString()}
------------------------------------------------------------------------
${body}
`;
  fs.writeFileSync(filePath, fileContent, "utf8");
  return filePath;
}
