import { NextResponse } from "next/server";
import { scrapePlayStoreReviews } from "@/backend/services/scraper";
import { cleanReviews, writeReviewsToCSV } from "@/backend/services/cleaner";

export async function POST() {
  try {
    const appId = process.env.GOOGLE_PLAY_APP_ID || "com.example.app";
    console.log(`API: Triggering review ingestion for "${appId}"...`);
    const raw = await scrapePlayStoreReviews(appId);
    const referenceDate = "2026-06-19T15:13:48Z";
    const cleaned = cleanReviews(raw, referenceDate);
    const csvPath = writeReviewsToCSV(cleaned, "data/cleaned_reviews.csv");
    
    return NextResponse.json({
      success: true,
      scrapedCount: raw.length,
      cleanedCount: cleaned.length,
      savedPath: csvPath,
    });
  } catch (error) {
    console.error("API Ingest failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
