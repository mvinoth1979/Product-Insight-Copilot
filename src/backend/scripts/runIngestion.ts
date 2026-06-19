import { loadEnvConfig } from "@next/env";
// Load Next.js environment configurations (.env, .env.local, etc.)
loadEnvConfig(process.cwd());

import { scrapePlayStoreReviews } from "../services/scraper";
import { cleanReviews, writeReviewsToCSV } from "../services/cleaner";

async function main() {
  const appId = process.env.GOOGLE_PLAY_APP_ID || "com.example.app";
  console.log(`Starting Review Ingestion for App ID: "${appId}"...`);
  
  try {
    const rawReviews = await scrapePlayStoreReviews(appId);
    console.log(`Successfully scraped ${rawReviews.length} raw reviews.`);

    const referenceDate = "2026-06-19T15:13:48Z"; // Fixed baseline timestamp
    const cleanedReviews = cleanReviews(rawReviews, referenceDate);
    console.log(`Cleaned reviews count: ${cleanedReviews.length} (Filtered duplicates, old/empty entries).`);

    const csvPath = writeReviewsToCSV(cleanedReviews, "data/cleaned_reviews.csv");
    console.log(`Saved cleaned reviews CSV to: ${csvPath}`);
    
    console.log("Ingestion Layer execution complete.");
  } catch (error) {
    console.error("Ingestion failed:", error);
    process.exit(1);
  }
}

main();

