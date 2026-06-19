import { llm } from "./llm";
import { ClusterResult, IsolatedFeeIssue } from "./clusterer";

export async function generateWeeklyPulse(
  clusterResult: ClusterResult,
  forceFallback: boolean = false
): Promise<string> {
  const topThemesStr = clusterResult.topThemes.join(", ");
  const themesSummary = clusterResult.themes
    .map(
      (t) =>
        `- Theme: ${t.name} (${t.count} reviews, ${t.percentage}%)\n  Quotes:\n  * "${t.quotes[0]}"\n  * "${t.quotes[1]}"`
    )
    .join("\n");

  const systemInstruction = `You are a professional product writer. Your job is to compile a short, high-density weekly briefing for product and engineering teams.
You must output in clean markdown format.
You must adhere to a strict word limit: Your output MUST be less than or equal to 250 words total. Count your words and keep it compact.
Your tone should be professional and analytical.`;

  const prompt = `Based on the following feedback themes and quotes:
Top Themes: ${topThemesStr}

Themes Summary:
${themesSummary}

Generate a weekly note containing:
1. Summary of top themes.
2. Supporting user quotes.
3. Key observation (what’s trending/broken).
4. Exactly 3 action ideas for the product team.

Write the note in markdown. Remember, the entire note MUST be under 250 words total. Do not output anything else.`;

  const response = await llm.callLLM(prompt, systemInstruction, forceFallback);
  return response.content.trim();
}

export async function generateFeeExplainer(
  feeIssue: IsolatedFeeIssue,
  forceFallback: boolean = false
): Promise<string> {
  const feeName = feeIssue.feeName;
  const description = feeIssue.description;
  const userQuotes = feeIssue.userQuotes.join(" | ");

  const systemInstruction = `You are a compliance and customer communications officer. Your job is to explain complex app charges to customers in a facts-only, objective, and neutral tone.
Do not apologize, do not use marketing speak, and do not make excuses. Explain the rules clearly.

Your output must match these constraints:
1. Bullet points: Max 6 bullet points total.
2. Official links: Include exactly 2 official-looking source links explaining the fee (e.g. "https://www.insightflow.com/fees/${feeName.toLowerCase().replace(/\s+/g, "-")}" and "https://www.insightflow.com/terms/pricing").
3. Timestamp: Add a metadata row at the end: "Last checked: YYYY-MM-DD" where YYYY-MM-DD is the current date ("2026-06-19").`;

  const prompt = `Explain the following isolated fee issue:
Fee Name: ${feeName}
Context: ${description}
Customer Pain: ${userQuotes}

Generate a structured explanation containing:
- Up to 6 bullet points explaining the fee clearly, in a neutral, facts-only tone.
- Exactly 2 official source links for exit loads/fees.
- "Last checked: 2026-06-19" row at the very end.

Only output the explanation bullets and links. Do not output introduction or conclusion sentences.`;

  const response = await llm.callLLM(prompt, systemInstruction, forceFallback);
  let content = response.content.trim();
  if (!content.toLowerCase().includes("last checked:")) {
    content += "\n\nLast checked: 2026-06-19";
  }
  return content;
}
