import fs from "fs";
import path from "path";
import { Review } from "./scraper";
import { resolveDataPath } from "../utils/pathHelper";
import { Pool } from "pg";

const MAX_AGE_MONTHS = 3;

function cleanText(text: string): string {
  if (!text) return "";
  // Strip HTML tags using regex
  let cleaned = text.replace(/<[^>]*>/g, "");
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

function escapeCSVField(field: string | number): string {
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export function cleanReviews(reviews: Review[], referenceDateStr: string = "2026-06-19T15:13:48Z"): Review[] {
  const referenceDate = new Date(referenceDateStr);
  const cutoffDate = new Date(referenceDate.getTime());
  cutoffDate.setMonth(cutoffDate.getMonth() - MAX_AGE_MONTHS);
  const cutoffTime = cutoffDate.getTime();

  const seen = new Set<string>();
  const cleanedList: Review[] = [];

  for (const review of reviews) {
    const rawText = review.reviewText || "";
    const cleanedText = cleanText(rawText);

    // 1. Filter out empty or whitespace-only reviews
    if (!cleanedText) {
      continue;
    }

    // 2. Filter out reviews older than 6 months
    const reviewTime = new Date(review.timestamp).getTime();
    if (reviewTime < cutoffTime) {
      continue;
    }

    // 3. Filter out single word reviews (e.g. "good", "poor", "ok")
    const words = cleanedText.trim().split(/\s+/);
    if (words.length <= 1) {
      continue;
    }

    // 4. Filter out emoji-only / symbol-only reviews (must contain at least one alphanumeric character)
    const hasAlphanumeric = /[a-zA-Z0-9]/.test(cleanedText);
    if (!hasAlphanumeric) {
      continue;
    }

    // 5. Deduplicate (same reviewer, same cleaned text, same rating, same timestamp)
    const uniqueKey = `${review.reviewerName}|${cleanedText}|${review.rating}|${review.timestamp}`;
    if (seen.has(uniqueKey)) {
      continue;
    }
    seen.add(uniqueKey);

    cleanedList.push({
      reviewerName: review.reviewerName.trim(),
      rating: review.rating,
      reviewText: cleanedText,
      timestamp: review.timestamp,
    });
  }

  return cleanedList;
}

export function writeReviewsToCSV(reviews: Review[], relativeOutputPath: string = "data/cleaned_reviews.csv"): string {
  const absolutePath = resolveDataPath(relativeOutputPath);
  const parentDir = path.dirname(absolutePath);

  // Ensure directories exist
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Generate CSV rows
  const headers = ["reviewerName", "rating", "reviewText", "timestamp"];
  const csvLines = [headers.join(",")];

  for (const review of reviews) {
    const line = [
      escapeCSVField(review.reviewerName),
      review.rating,
      escapeCSVField(review.reviewText),
      review.timestamp,
    ];
    csvLines.push(line.join(","));
  }

  const csvContent = csvLines.join("\n");
  fs.writeFileSync(absolutePath, csvContent, "utf8");

  return absolutePath;
}

let pgPool: Pool | null = null;

function getPgPool(): Pool {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pgPool;
}

export async function saveReviews(reviews: Review[], relativeOutputPath: string = "data/cleaned_reviews.csv"): Promise<string> {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    console.log("Database URL configured. Writing reviews to PostgreSQL...");
    const pool = getPgPool();
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");
      
      // Auto-create table if not exists
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

      const insertQuery = `
        INSERT INTO reviews (reviewer_name, rating, review_text, timestamp)
        VALUES ($1, $2, $3, $4)
      `;

      for (const r of reviews) {
        await client.query(insertQuery, [
          r.reviewerName,
          r.rating,
          r.reviewText,
          r.timestamp,
        ]);
      }

      await client.query("COMMIT");
      console.log(`Successfully committed ${reviews.length} reviews to PostgreSQL.`);
      return "postgres://database";
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("PostgreSQL Transaction Failed, rolling back.", e);
      throw e;
    } finally {
      client.release();
    }
  }

  // Fallback to local CSV writing
  return writeReviewsToCSV(reviews, relativeOutputPath);
}
