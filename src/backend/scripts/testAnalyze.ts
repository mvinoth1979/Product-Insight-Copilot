import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { clusterReviewsFromCSV } from "../services/clusterer";
import { generateWeeklyPulse, generateFeeExplainer } from "../services/generator";

async function main() {
  console.log("Analyzing reviews...");
  try {
    const clusterResult = await clusterReviewsFromCSV("data/cleaned_reviews.csv");
    console.log("\n--- CLUSTER RESULT ---");
    console.log(JSON.stringify(clusterResult, null, 2));

    console.log("\n--- WEEKLY PULSE ---");
    const pulse = await generateWeeklyPulse(clusterResult);
    console.log(pulse);

    console.log("\n--- FEE EXPLAINER ---");
    const explainer = await generateFeeExplainer(clusterResult.isolatedFeeIssue);
    console.log(explainer);
  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

main();
