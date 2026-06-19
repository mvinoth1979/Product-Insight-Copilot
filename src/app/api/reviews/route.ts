import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseCSV } from "@/backend/services/clusterer";
import { resolveDataPath } from "@/backend/utils/pathHelper";

export async function GET() {
  try {
    const csvPath = resolveDataPath("data/cleaned_reviews.csv");
    
    // If file doesn't exist, trigger ingestion to create it
    if (!fs.existsSync(csvPath)) {
      console.log("Reviews CSV not found. Auto-triggering ingestion...");
      const { scrapePlayStoreReviews } = await import("@/backend/services/scraper");
      const { cleanReviews, writeReviewsToCSV } = await import("@/backend/services/cleaner");
      const appId = process.env.GOOGLE_PLAY_APP_ID || "com.example.app";
      const raw = await scrapePlayStoreReviews(appId);
      const cleaned = cleanReviews(raw, "2026-06-19T15:13:48Z");
      writeReviewsToCSV(cleaned, "data/cleaned_reviews.csv");
    }

    const csvContent = fs.readFileSync(csvPath, "utf8");
    const reviews = parseCSV(csvContent);

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("API Fetch Reviews failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
