import { NextResponse } from "next/server";
import { executeMCPSync, NotionSyncPayload } from "@/backend/services/mcpClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { feeName, weeklyPulse, feeExplainer, topThemes } = body;

    if (!feeName || !weeklyPulse || !feeExplainer) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (feeName, weeklyPulse, feeExplainer)" },
        { status: 400 }
      );
    }

    console.log("API: Triggering MCP Gated Sync...");

    // 1. Parse bullets and links from the explainer text
    const lines = feeExplainer.split("\n").map((l: string) => l.trim());
    const explanation_bullets = lines.filter((l: string) => l.startsWith("*") || l.startsWith("-"));
    
    // Simple regex to extract links
    const source_links: string[] = [];
    for (const line of lines) {
      const linksInLine = line.match(/https?:\/\/[^\s]+/g);
      if (linksInLine) {
        for (const link of linksInLine) {
          // Clean punctuation from links (e.g. trailing periods or commas)
          source_links.push(link.replace(/[.,;]$/, ""));
        }
      }
    }

    // 2. Build Notion Sync Payload
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const notionPayload: NotionSyncPayload = {
      date,
      top_themes: topThemes || ["Pricing Confusion"],
      weekly_pulse: weeklyPulse,
      identified_fee_issue: feeName,
      explanation_bullets,
      source_links: source_links.slice(0, 2), // We need exactly 2 official links
    };

    // 3. Build Email Draft Content
    const emailSubject = `Weekly Product Pulse + Customer Clarification — ${feeName}`;
    const emailBody = `Weekly Product Pulse:
------------------------------------------------------------------------
${weeklyPulse}

========================================================================
Customer Clarification — ${feeName} Explainer Snippet:
------------------------------------------------------------------------
${feeExplainer}
`;

    // 4. Execute the MCP operations
    const syncResult = await executeMCPSync(notionPayload, emailSubject, emailBody);

    return NextResponse.json({
      success: syncResult.success,
      notionStatus: syncResult.notionStatus,
      gmailStatus: syncResult.gmailStatus,
      notionDetails: syncResult.notionDetails,
      gmailDetails: syncResult.gmailDetails,
    });
  } catch (error) {
    console.error("API Approve failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
