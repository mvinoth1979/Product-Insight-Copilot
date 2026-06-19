import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { llm } from "../services/llm";
import Groq from "groq-sdk";
import { clusterReviewsFromCSV } from "../services/clusterer";
import { generateWeeklyPulse, generateFeeExplainer } from "../services/generator";

test("LLM Pipeline & Output Generation Tests", async (t) => {
  // Ensure we have a mock CSV file ready for tests
  const testCSVPath = "data/test_generator_reviews.csv";
  const absoluteCSVPath = path.resolve(process.cwd(), testCSVPath);
  const csvContent = `reviewerName,rating,reviewText,timestamp
"Aarav Sharma",2,"They charged me a 1% exit load when I withdrew my funds. Terrible experience!","2026-06-12T15:13:48.000Z"
"Carlos Ray",1,"App keeps crashing on the login screen since the last update. Please fix!","2026-06-05T15:13:48.000Z"`;
  
  fs.mkdirSync(path.dirname(absoluteCSVPath), { recursive: true });
  fs.writeFileSync(absoluteCSVPath, csvContent, "utf8");

  t.after(() => {
    if (fs.existsSync(absoluteCSVPath)) {
      fs.unlinkSync(absoluteCSVPath);
    }
  });

  await t.test("clusterReviewsFromCSV successfully parses LLM JSON outputs", async (context) => {
    const mockJSONResponse = {
      themes: [
        {
          name: "Exit Load Complaints",
          count: 1,
          percentage: 50,
          quotes: ["They charged me a 1% exit load when I withdrew my funds."]
        },
        {
          name: "Login Stability",
          count: 1,
          percentage: 50,
          quotes: ["App keeps crashing on the login screen since the last update."]
        }
      ],
      topThemes: ["Exit Load Complaints", "Login Stability"],
      isolatedFeeIssue: {
        feeName: "Exit Load",
        description: "Users are reporting confusion over the 1% exit load charge upon early withdrawal.",
        userQuotes: ["They charged me a 1% exit load when I withdrew my funds."]
      }
    };

    // Mock callLLM to return our mock JSON
    context.mock.method(llm, "callLLM", async () => {
      return {
        content: JSON.stringify(mockJSONResponse),
        modelUsed: "gemini" as const,
      };
    });

    const result = await clusterReviewsFromCSV(testCSVPath);
    
    assert.strictEqual(result.themes.length, 2);
    assert.strictEqual(result.themes[0].name, "Exit Load Complaints");
    assert.strictEqual(result.topThemes[0], "Exit Load Complaints");
    assert.strictEqual(result.isolatedFeeIssue.feeName, "Exit Load");
    assert.strictEqual(result.modelUsed, "gemini");
  });

  await t.test("generateWeeklyPulse outputs formatted Markdown and respects length bounds", async (context) => {
    const mockClusterResult = {
      themes: [
        {
          name: "Exit Load Confusion",
          count: 1,
          percentage: 50,
          quotes: ["They charged me exit load!"]
        }
      ],
      topThemes: ["Exit Load Confusion"],
      isolatedFeeIssue: {
        feeName: "Exit Load",
        description: "Exit load charges are unclear.",
        userQuotes: ["They charged me exit load!"]
      }
    };

    const mockPulseContent = `# Weekly Product Pulse
## Themes
* **Exit Load Confusion (50%)**: Users complain about unexpected fees on early fund withdrawal.
  > "They charged me exit load!"

## Observations
Billing clarity is trending down. Users expect full transparency before withdraw actions.

## Action Items
1. Display exit load fee schedule clearly on withdrawal slider.
2. Draft a canned explanation for support leads.
3. Update onboarding FAQ documentation.`;

    context.mock.method(llm, "callLLM", async () => {
      return {
        content: mockPulseContent,
        modelUsed: "gemini" as const,
      };
    });

    const pulse = await generateWeeklyPulse(mockClusterResult);
    
    // Assert title exists
    assert.ok(pulse.includes("# Weekly Product Pulse"), "Markdown title should exist");
    
    // Assert word count is <= 250 words
    const wordCount = pulse.split(/\s+/).filter(Boolean).length;
    assert.ok(wordCount <= 250, `Pulse word count (${wordCount}) should be <= 250 words`);
  });

  await t.test("generateFeeExplainer outputs formatted bullet points and required metadata", async (context) => {
    const mockFeeIssue = {
      feeName: "Exit Load",
      description: "Exit load charges are confusing.",
      userQuotes: ["They charged me exit load!"]
    };

    const mockExplainerContent = `* Exit load is a fee charged when you redeem mutual fund units before a specified lock-in period.
* The fee is calculated as 1% of the total asset value if withdrawn within 365 days of investment.
* No exit load is charged for redemptions made after 1 year.
* This fee is standard across investment platforms to encourage long-term holdings.
* Official source: https://www.insightflow.com/fees/exit-load
* Official terms: https://www.insightflow.com/terms/pricing
Last checked: 2026-06-19`;

    context.mock.method(llm, "callLLM", async () => {
      return {
        content: mockExplainerContent,
        modelUsed: "gemini" as const,
      };
    });

    const explainer = await generateFeeExplainer(mockFeeIssue);
    
    const lines = explainer.split("\n").map(l => l.trim());
    
    // Assert bullet points count is <= 6 (excluding links & check row)
    const bulletLines = lines.filter(l => l.startsWith("*"));
    assert.ok(bulletLines.length <= 6, `Bullets count (${bulletLines.length}) should be <= 6`);

    // Assert links are included
    assert.ok(explainer.includes("https://www.insightflow.com/fees/exit-load"), "Must contain source link 1");
    assert.ok(explainer.includes("https://www.insightflow.com/terms/pricing"), "Must contain source link 2");

    // Assert "Last checked" is present
    assert.ok(explainer.includes("Last checked: 2026-06-19"), "Must include Last checked date stamp");
  });

  await t.test("callLLM successfully routes to Groq if Gemini is missing or fails", async (context) => {
    // Save original env keys
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    const originalGroqKey = process.env.GROQ_API_KEY;

    // Dynamically extract prototype of completions to intercept network request
    const dummyGroq = new Groq({ apiKey: "dummy-groq-key" });
    const completionsProto = Object.getPrototypeOf(dummyGroq.chat.completions);
    context.mock.method(completionsProto, "create", async () => {
      return {
        choices: [{ message: { content: "Mocked Groq text" } }]
      };
    });

    try {
      // Mock environment keys
      process.env.GEMINI_API_KEY = "dummy-gemini-key";
      process.env.GROQ_API_KEY = "dummy-groq-key";

      // 1. Force Groq Fallback directly
      const groqResponse = await llm.callLLM("Hello", undefined, true);
      assert.strictEqual(groqResponse.modelUsed, "groq", "Should force Groq when forceFallback is enabled");
      
    } finally {
      // Restore env
      process.env.GEMINI_API_KEY = originalGeminiKey;
      process.env.GROQ_API_KEY = originalGroqKey;
    }
  });
});
