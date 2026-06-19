import { NextResponse } from "next/server";
import { clusterReviewsFromCSV } from "@/backend/services/clusterer";
import { generateWeeklyPulse, generateFeeExplainer } from "@/backend/services/generator";

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const hasKeys = !!(geminiKey || groqKey);

  try {
    if (hasKeys) {
      console.log("API: Running real LLM theme analysis and generating briefs...");
      const clusterResult = await clusterReviewsFromCSV("data/cleaned_reviews.csv");
      
      const weeklyPulse = await generateWeeklyPulse(clusterResult);
      const feeExplainer = await generateFeeExplainer(clusterResult.isolatedFeeIssue);

      return NextResponse.json({
        success: true,
        mode: "live",
        clusterResult,
        weeklyPulse,
        feeExplainer,
      });
    } else {
      console.warn("API: API keys missing. Returning pre-compiled mock analysis payloads.");
      
      // Premium Mock Category Analysis matching mock CSV reviews
      const mockClusterResult = {
        themes: [
          {
            name: "Exit Load Confusion",
            count: 4,
            percentage: 36,
            quotes: [
              "They charged me a 1% exit load when I withdrew my funds. The app didn't show this anywhere during investment!",
              "Hidden exit load fees! I was shocked to see a deduction on withdrawal.",
              "App is good but exit load policies are very confusing."
            ]
          },
          {
            name: "App Stability & Crashes",
            count: 1,
            percentage: 9,
            quotes: [
              "App keeps crashing on the login screen since the last update. Using Samsung S22."
            ]
          },
          {
            name: "User Interface (UI/UX)",
            count: 2,
            percentage: 18,
            quotes: [
              "Super sleek dark mode! The transitions are so smooth.",
              "The new UI update is very confusing. Fonts are too small and hard to read."
            ]
          },
          {
            name: "General Usability",
            count: 3,
            percentage: 27,
            quotes: [
              "Easy to use interface. Makes tracking investments very simple.",
              "Good app, but loading times are sometimes slow on mobile network.",
              "Highly recommend for beginners."
            ]
          },
          {
            name: "Customer Support Friction",
            count: 1,
            percentage: 10,
            quotes: [
              "Extremely slow customer service. Raised a ticket for transaction failure and got no reply for 3 days."
            ]
          }
        ],
        topThemes: ["Exit Load Confusion", "General Usability", "User Interface (UI/UX)"],
        isolatedFeeIssue: {
          feeName: "Exit Load",
          description: "Users are expressing recurring frustration and shock regarding a 1% exit load charge applied unexpectedly during early fund redemptions, noting that disclosure is absent in primary investment confirmation views.",
          userQuotes: [
            "They charged me a 1% exit load when I withdrew my funds. The app didn't show this anywhere during investment!",
            "Hidden exit load fees! I was shocked to see a deduction on withdrawal.",
            "App is good but exit load policies are very confusing."
          ]
        }
      };

      const mockWeeklyPulse = `# Weekly Product Pulse - June 19, 2026

## Executive Summary
Recent Google Play reviews highlight critical user friction surrounding **Exit Load Fees**, which represents 36% of all negative sentiment. General Usability is solid, but UI/UX updates have introduced minor readability concerns.

## Supporting User Quotes
* > "They charged me a 1% exit load when I withdrew my funds. The app didn't show this anywhere!"
* > "App keeps crashing on the login screen since the last update."

## Key Observation
There is a severe transparency gap in early redemptions. Users are surprised by standard exit loads, suggesting the disclosure copy during deposits is obscure or missing in key flows.

## Action Items
1. **Redesign Deposit Slip:** Add a clear exit load notice before final transaction confirmation.
2. **Develop Support Snippet:** Distribute a reusable canned response explaining exit load terms.
3. **Fix Android Crash:** Inspect login flow exceptions on Samsung S22 devices.`;

      const mockFeeExplainer = `* Exit load is a small processing fee charged by mutual funds when you redeem or sell your units before a specified timeframe.
* For our standard plans, an exit load of 1.0% is applied only if funds are withdrawn within 365 days of deposit.
* Redemptions made after 365 days of holdings are completely free from exit loads.
* This fee is standard across investment platforms to discourage short-term speculation.
* Official source: https://www.insightflow.com/fees/exit-load
* Official terms: https://www.insightflow.com/terms/pricing
Last checked: 2026-06-19`;

      return NextResponse.json({
        success: true,
        mode: "mock",
        clusterResult: mockClusterResult,
        weeklyPulse: mockWeeklyPulse,
        feeExplainer: mockFeeExplainer,
      });
    }
  } catch (error) {
    console.error("API Analyze failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
