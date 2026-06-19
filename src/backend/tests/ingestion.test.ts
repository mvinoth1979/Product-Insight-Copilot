import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import { scrapePlayStoreReviews } from "../services/scraper";
import { cleanReviews, writeReviewsToCSV } from "../services/cleaner";

test("Ingestion Layer Tests", async (t) => {
  await t.test("Scraper returns raw reviews with correct fields", async () => {
    const rawReviews = await scrapePlayStoreReviews("com.example.app");
    
    assert.ok(rawReviews.length > 0, "Should generate mock reviews");
    
    const sample = rawReviews[0];
    assert.ok(sample.reviewerName, "Reviewer name should exist");
    assert.ok(sample.rating >= 1 && sample.rating <= 5, "Rating should be between 1 and 5");
    assert.ok(sample.timestamp, "Timestamp should exist");
    assert.ok(typeof sample.reviewText === "string", "Review text should be a string");
  });

  await t.test("Cleaner filters out duplicates, empty reviews, and old reviews", () => {
    const mockNow = "2026-06-19T15:13:48Z";
    const rawReviews = [
      // Normal review
      {
        reviewerName: "User 1",
        rating: 5,
        reviewText: "Great app!",
        timestamp: "2026-06-12T10:00:00Z", // 1 week ago (Valid)
      },
      // Duplicate review
      {
        reviewerName: "User 1",
        rating: 5,
        reviewText: "Great app!",
        timestamp: "2026-06-12T10:00:00Z", // Duplicate
      },
      // Empty review
      {
        reviewerName: "User 2",
        rating: 4,
        reviewText: "   ", // Whitespace (Invalid)
        timestamp: "2026-06-11T12:00:00Z",
      },
      // HTML review to be cleaned
      {
        reviewerName: "User 3",
        rating: 3,
        reviewText: "<p>Nice but has <b>bugs</b></p>", // HTML
        timestamp: "2026-06-10T14:00:00Z",
      },
      // Outdated review
      {
        reviewerName: "User 4",
        rating: 2,
        reviewText: "Old fee complaints.",
        timestamp: "2025-10-01T15:00:00Z", // October (Older than 6 months from June 19)
      }
    ];

    const cleaned = cleanReviews(rawReviews, mockNow);

    // Assert length: only User 1 (one copy) and User 3 should survive.
    // User 1 duplicate is filtered, User 2 is empty/whitespace, User 4 is too old.
    assert.strictEqual(cleaned.length, 2, "Only 2 reviews should remain");

    // Check duplicate filter
    const user1Count = cleaned.filter(r => r.reviewerName === "User 1").length;
    assert.strictEqual(user1Count, 1, "User 1 duplicate should be filtered");

    // Check HTML cleaning
    const user3 = cleaned.find(r => r.reviewerName === "User 3");
    assert.ok(user3, "User 3 should exist");
    assert.strictEqual(user3.reviewText, "Nice but has bugs", "HTML tags should be stripped and trimmed");
  });

  await t.test("CSV writing writes clean reviews to file system", () => {
    const sampleReviews = [
      {
        reviewerName: "Alice, Bob & Charlie",
        rating: 5,
        reviewText: 'Excellent "features" here, no bugs!',
        timestamp: "2026-06-19T10:00:00Z",
      }
    ];

    const testOutputPath = "data/test_cleaned_reviews.csv";
    const absolutePath = writeReviewsToCSV(sampleReviews, testOutputPath);

    assert.ok(fs.existsSync(absolutePath), "CSV file should be written to path");

    const content = fs.readFileSync(absolutePath, "utf8");
    const lines = content.split("\n");

    // Line 0: headers
    assert.strictEqual(lines[0], "reviewerName,rating,reviewText,timestamp");

    // Line 1: data with escaped quotes and commas
    assert.strictEqual(
      lines[1],
      '"Alice, Bob & Charlie",5,"Excellent ""features"" here, no bugs!",2026-06-19T10:00:00Z'
    );

    // Cleanup test file
    fs.unlinkSync(absolutePath);
  });
});
