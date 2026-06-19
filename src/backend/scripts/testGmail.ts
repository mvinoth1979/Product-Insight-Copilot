import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env if dotenv isn't imported or to make sure it loads
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    for (const line of envConfig.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    }
  }
}

loadEnv();

function buildRawEmail(subject: string, body: string, to: string = "support-leads@company.com"): string {
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    body
  ];
  return Buffer.from(emailLines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function testGmail() {
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gmailClientId = process.env.GMAIL_CLIENT_ID;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;

  console.log("Loaded credentials:");
  console.log("Client ID:", gmailClientId);
  console.log("Client Secret:", gmailClientSecret ? "(Present)" : "(Missing)");
  console.log("Refresh Token:", gmailRefreshToken ? "(Present)" : "(Missing)");

  if (!gmailClientSecret || !gmailClientId || !gmailRefreshToken) {
    console.error("Missing credentials in .env file!");
    return;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      gmailClientId,
      gmailClientSecret,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: gmailRefreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const rawContent = buildRawEmail("Test Subject " + Date.now(), "This is a test draft body.");

    console.log("Sending request to Gmail drafts.create...");
    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: rawContent,
        },
      },
    });

    console.log("SUCCESS! Gmail draft created:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error("FAILURE! Error creating draft:");
    if (error.response && error.response.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error);
    }
  }
}

testGmail();
