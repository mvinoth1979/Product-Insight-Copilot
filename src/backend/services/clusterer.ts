import fs from "fs";
import path from "path";
import { llm } from "./llm";
import { resolveDataPath } from "../utils/pathHelper";
import { Pool } from "pg";

export interface Theme {
  name: string;
  count: number;
  percentage: number;
  quotes: string[];
}

export interface IsolatedFeeIssue {
  feeName: string;
  description: string;
  userQuotes: string[];
}

export interface ClusterResult {
  themes: Theme[];
  topThemes: string[];
  isolatedFeeIssue: IsolatedFeeIssue;
  rawResponse?: string;
  modelUsed?: string;
}

// Robust custom CSV parser to avoid dependency issues
export function parseCSV(content: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "\n" || char === "\r") {
      if (inQuotes) {
        currentLine += char;
      } else {
        if (char === "\r" && nextChar === "\n") {
          i++; // skip \n
        }
        lines.push(currentLine);
        currentLine = "";
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  const headers = splitCSVLine(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = splitCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      const headerKey = h.trim();
      obj[headerKey] = values[idx] ? values[idx].trim() : "";
    });
    records.push(obj);
  }

  return records;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ",") {
      if (inQuotes) {
        current += char;
      } else {
        result.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function cleanJSONResponse(content: string): string {
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();

  // Repair trailing commas in arrays/objects (e.g. [1, 2,] or {a:1,})
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
  // Repair stray comma between array close and object close (e.g., `] \n , \n }`)
  cleaned = cleaned.replace(/\]\s*,\s*}/g, "]}");

  return cleaned;
}

export async function clusterReviewsFromCSV(
  csvFilePath: string = "data/cleaned_reviews.csv",
  forceFallback: boolean = false
): Promise<ClusterResult> {
  const dbUrl = process.env.DATABASE_URL;
  let records: Record<string, string>[] = [];

  if (dbUrl) {
    console.log("Database URL configured. Reading reviews from PostgreSQL...");
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT reviewer_name AS "reviewerName", rating::text, review_text AS "reviewText", timestamp::text
        FROM reviews
        ORDER BY timestamp DESC
      `);
      records = res.rows;
    } finally {
      client.release();
      await pool.end();
    }
  } else {
    const absolutePath = resolveDataPath(csvFilePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Reviews CSV file not found at: ${absolutePath}`);
    }
    const csvContent = fs.readFileSync(absolutePath, "utf8");
    records = parseCSV(csvContent);
  }

  if (records.length === 0) {
    return {
      themes: [],
      topThemes: [],
      isolatedFeeIssue: { feeName: "None", description: "No reviews to analyze", userQuotes: [] },
    };
  }

  // Format reviews to send to the LLM (take up to the 100 most recent reviews to avoid token limit errors)
  const formattedReviews = records
    .slice(0, 100)
    .map((r, idx) => `[Review ${idx + 1}] Rating: ${r.rating} stars | Text: "${r.reviewText}"`)
    .join("\n\n");

  const systemInstruction = `You are an expert product analyst. Your job is to analyze user reviews and cluster them into distinct thematic categories.
You must output your analysis in strict JSON format. Do not write any conversational preamble or wrap the JSON in markdown blocks. Output only raw JSON.

Your JSON output must exactly match this TypeScript schema:
{
  "themes": Array<{
    "name": string; // Thematic category (max 5 themes total)
    "count": number; // How many reviews match this theme
    "percentage": number; // Rounded percentage of total reviews
    "quotes": Array<string>; // Exactly 3 representative raw quotes from the reviews
  }>,
  "topThemes": Array<string>, // The top 3 theme names sorted by priority/volume
  "isolatedFeeIssue": {
    "feeName": string; // The exact name of the specific confusing fee isolated (e.g. "Exit Load", "Convenience Fee"). Use "None" if no fee issues exist.
    "description": string; // High-level description of what the user confusion/complaint is about regarding this fee.
    "userQuotes": Array<string>; // 2-3 real quotes representing this fee confusion
  }
}`;

  const prompt = `Here are the cleaned user reviews:
${formattedReviews}

Analyze the reviews, cluster them into maximum 5 themes, identify the top 3 themes, and isolate exactly 1 recurring complaint/confusion related to a fee or charge. Format your response exactly as the requested JSON schema.`;

  const response = await llm.callLLM(prompt, systemInstruction, forceFallback);
  const cleanedJSON = cleanJSONResponse(response.content);

  try {
    const result = JSON.parse(cleanedJSON) as ClusterResult;
    result.rawResponse = response.content;
    result.modelUsed = response.modelUsed;
    return result;
  } catch (error) {
    console.error("Failed to parse JSON response from LLM:", cleanedJSON);
    throw new Error(`LLM output was not valid JSON. Error: ${String(error)}. Output: ${cleanedJSON}`);
  }
}
