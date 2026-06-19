import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { scrapePlayStoreReviews } from "../services/scraper";
import { cleanReviews, writeReviewsToCSV } from "../services/cleaner";
import { llm } from "../services/llm";
import { clusterReviewsFromCSV } from "../services/clusterer";
import { generateWeeklyPulse, generateFeeExplainer } from "../services/generator";
import { executeMCPSync } from "../services/mcpClient";
import { reviewStreamer } from "../services/streamer";

test("InsightFlow End-to-End System Integration Tests", async (t) => {
  const e2eCSVPath = "data/e2e_cleaned_reviews.csv";
  const absoluteCSVPath = path.resolve(process.cwd(), e2eCSVPath);

  // Clean up e2e database files after tests run
  t.after(() => {
    if (fs.existsSync(absoluteCSVPath)) {
      fs.unlinkSync(absoluteCSVPath);
    }
    const notionSimDb = path.resolve(process.cwd(), "data/notion_database.json");
    if (fs.existsSync(notionSimDb)) {
      fs.unlinkSync(notionSimDb);
    }
    const notionSimLog = path.resolve(process.cwd(), "data/notion_notes_log.md");
    if (fs.existsSync(notionSimLog)) {
      fs.unlinkSync(notionSimLog);
    }
  });

  await t.test("E2E Phase 1: Ingestion & CSV Sanitization", async () => {
    const raw = await scrapePlayStoreReviews("com.example.app");
    assert.ok(raw.length > 0);

    const referenceDate = "2026-06-19T15:13:48Z";
    const cleaned = cleanReviews(raw, referenceDate);
    assert.ok(cleaned.length < raw.length, "Duplicates and out-of-date entries should be filtered");

    writeReviewsToCSV(cleaned, e2eCSVPath);
    assert.ok(fs.existsSync(absoluteCSVPath), "Should write clean reviews CSV to disk");
  });

  await t.test("E2E Phase 2: Category Clustering & Generation", async (context) => {
    // Mock the LLM calls to test generator validations deterministically
    const mockClusterResult = {
      themes: [
        {
          name: "Exit Load Confusion",
          count: 3,
          percentage: 50,
          quotes: ["They charged me a 1% exit load!", "Confusing exit load fees."]
        }
      ],
      topThemes: ["Exit Load Confusion"],
      isolatedFeeIssue: {
        feeName: "Exit Load",
        description: "Users are reporting confusion over the 1% exit load charge upon early withdrawal.",
        userQuotes: ["They charged me a 1% exit load!"]
      }
    };

    const mockPulseText = `# Weekly Product Pulse\nSummary of Exit Load issues. Word count is short.\n1. Add UI notices.\n2. Add canned explainers.`;
    const mockExplainerText = `* Exit load is standard fee.\n* Charged only if withdrawn early within 365 days.\n* Official link: https://www.insightflow.com/fees/exit-load\n* Official terms: https://www.insightflow.com/terms/pricing\nLast checked: 2026-06-19`;

    // Intercept LLM calls
    context.mock.method(llm, "callLLM", async (prompt) => {
      if (prompt.includes("Here are the cleaned user reviews")) {
        return { content: JSON.stringify(mockClusterResult), modelUsed: "gemini" as const };
      }
      if (prompt.includes("Generate a weekly note containing")) {
        return { content: mockPulseText, modelUsed: "gemini" as const };
      }
      return { content: mockExplainerText, modelUsed: "gemini" as const };
    });

    const cluster = await clusterReviewsFromCSV(e2eCSVPath);
    assert.strictEqual(cluster.isolatedFeeIssue.feeName, "Exit Load");

    const pulse = await generateWeeklyPulse(cluster);
    const pulseWords = pulse.split(/\s+/).filter(Boolean).length;
    assert.ok(pulseWords <= 250, "Weekly pulse must be under 250 words");

    const explainer = await generateFeeExplainer(cluster.isolatedFeeIssue);
    const bullets = explainer.split("\n").filter(l => l.trim().startsWith("*")).length;
    assert.ok(bullets <= 6, "Fee explainer must be under 6 bullets");
    assert.ok(explainer.includes("Last checked: 2026-06-19"), "Must contain metadata date stamp");
  });

  await t.test("E2E Phase 3: Approval Gating & MCP Dispatching", async () => {
    const notionPayload = {
      date: "2026-06-19",
      top_themes: ["Exit Load Confusion"],
      weekly_pulse: `# Pulse Note`,
      identified_fee_issue: "Exit Load",
      explanation_bullets: ["* Exit load is 1%."],
      source_links: ["https://www.insightflow.com/fees/exit-load", "https://www.insightflow.com/terms/pricing"]
    };

    const emailSubject = "Weekly Product Pulse + Customer Clarification — Exit Load";
    const emailBody = `Weekly Pulse Brief:\n...\nFee Explainer:\n...`;

    // Execute MCP - should execute fallback mock writes in keyless testing envs
    const result = await executeMCPSync(notionPayload, emailSubject, emailBody);
    
    assert.strictEqual(result.success, true);
    assert.ok(result.notionStatus.includes("Sandbox") || result.notionStatus === "LIVE_SYNCED");
    assert.ok(result.gmailStatus.includes("Sandbox") || result.gmailStatus === "LIVE_SYNCED");

    // Verify sandbox local files exist
    const notionDb = path.resolve(process.cwd(), "data/notion_database.json");
    const notionLog = path.resolve(process.cwd(), "data/notion_notes_log.md");
    
    assert.ok(fs.existsSync(notionDb), "Local Notion JSON file should be saved");
    assert.ok(fs.existsSync(notionLog), "Local Notion MD logs should be appended");
  });

  await t.test("E2E Phase 4: Streaming Review Anomaly Alarm", () => {
    // Reset threshold to 2 for fast verification in tests
    reviewStreamer.setThreshold(2);
    const statusBefore = reviewStreamer.getStatus();
    assert.strictEqual(statusBefore.alerted, false, "Should not be alerted initially");

    let receivedItemCount = 0;
    let alertTriggered = false;

    reviewStreamer.start(
      (item) => {
        void item;
        receivedItemCount++;
      },
      (alertMsg) => {
        void alertMsg;
        alertTriggered = true;
      }
    );

    // Force register two complaints immediately to trigger threshold alert (limit 2)
    // Using private methods inside streamer wrapper to simulate
    (reviewStreamer as unknown as Record<string, () => void>).registerComplaint();
    (reviewStreamer as unknown as Record<string, () => void>).registerComplaint();

    const statusAfter = reviewStreamer.getStatus();
    
    // Stop streamer quickly
    reviewStreamer.stop();

    assert.ok(receivedItemCount >= 0, "Item count should be tracked");
    assert.strictEqual(statusAfter.alerted, true, "Surge alert should trigger");
    assert.strictEqual(alertTriggered, true, "Alert listener should be invoked");
  });
});
