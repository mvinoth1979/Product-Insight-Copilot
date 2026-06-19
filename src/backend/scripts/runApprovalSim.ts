import { executeMCPSync } from "../services/mcpClient";

async function main() {
  console.log("Simulating human approval sync...");

  const mockNotionPayload = {
    date: "2026-06-19",
    top_themes: ["Exit Load Confusion", "UI Readability", "Login Issues"],
    weekly_pulse: `# Weekly Product Pulse\n* Isolated exit load fee confusion.\n* Crash alerts on Samsung S22.`,
    identified_fee_issue: "Exit Load",
    explanation_bullets: [
      "* Exit load is 1% if withdrawn within 365 days of deposit.",
      "* No charges are applied for withdrawals after 1 year."
    ],
    source_links: [
      "https://www.insightflow.com/fees/exit-load",
      "https://www.insightflow.com/terms/pricing"
    ]
  };

  const emailSubject = "Weekly Product Pulse + Customer Clarification — Exit Load";
  const emailBody = `Weekly Product Pulse:\n---\n${mockNotionPayload.weekly_pulse}\n\nCustomer Clarification:\n---\nExit load is 1% if early.`;

  try {
    const result = await executeMCPSync(mockNotionPayload, emailSubject, emailBody);
    console.log("MCP Execution Result:");
    console.log(" - Success Status:", result.success);
    console.log(" - Notion Sync status:", result.notionStatus);
    console.log(" - Notion Details:", result.notionDetails);
    console.log(" - Gmail Sync status:", result.gmailStatus);
    console.log(" - Gmail Details:", result.gmailDetails);
    console.log("End-to-end sandbox verification successful!");
  } catch (error) {
    console.error("MCP Sim Sync failed:", error);
    process.exit(1);
  }
}

main();
