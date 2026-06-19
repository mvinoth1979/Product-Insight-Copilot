import { NextResponse } from "next/server";
import fs from "fs";
import { parseCSV } from "@/backend/services/clusterer";
import { resolveDataPath } from "@/backend/utils/pathHelper";
import { Pool } from "pg";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  try {
    let reviews: Record<string, string>[] = [];

    if (dbUrl) {
      console.log("API: Reading reviews from PostgreSQL database...");
      const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
      });
      const client = await pool.connect();
      try {
        // Auto-create table if not exists just in case reviews API is called first
        await client.query(`
          CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            reviewer_name TEXT,
            rating INTEGER,
            review_text TEXT,
            timestamp TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);

        const res = await client.query(`
          SELECT reviewer_name AS "reviewerName", rating::text, review_text AS "reviewText", timestamp::text
          FROM reviews
          ORDER BY timestamp DESC
        `);
        reviews = res.rows;
      } finally {
        client.release();
        await pool.end();
      }
    } else {
      const csvPath = resolveDataPath("data/cleaned_reviews.csv");
      
      // If file doesn't exist, trigger ingestion to create it
      if (!fs.existsSync(csvPath)) {
        console.log("Reviews CSV not found. Auto-triggering ingestion...");
        const { scrapePlayStoreReviews } = await import("@/backend/services/scraper");
        const { cleanReviews, saveReviews } = await import("@/backend/services/cleaner");
        const appId = process.env.GOOGLE_PLAY_APP_ID || "com.example.app";
        const raw = await scrapePlayStoreReviews(appId);
        const cleaned = cleanReviews(raw, "2026-06-19T15:13:48Z");
        await saveReviews(cleaned, "data/cleaned_reviews.csv");
      }

      const csvContent = fs.readFileSync(csvPath, "utf8");
      reviews = parseCSV(csvContent);
    }

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
