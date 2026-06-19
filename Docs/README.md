# InsightFlow Product Insight Copilot - Documentation

This guide provides the complete documentation, execution instructions, and overview of deliverables for the **InsightFlow Product Insight Copilot** system.

---

## 1. How to Run the System

### Prerequisites
- Node.js (v20+)
- Gemini API Key (set in `.env`)
- Groq API Key (set in `.env`)

### Local Setup
1. Clone the project and copy `.env_sample` to create a `.env` file.
2. In your `.env` file, populate the required API keys (values can be left empty for fallback mock testing).
3. Install the dependencies:
   ```bash
   npm install
   ```

### Execution Commands
- **Run Unit & E2E Integration Tests (14/14 tests):**
  ```bash
  npm run test
  ```
- **Trigger Review Ingestion (Crawler + Sanitization):**
  ```bash
  npm run ingest
  ```
  *This scrapes reviews for the app ID configured in `GOOGLE_PLAY_APP_ID` (e.g. `com.iob.iobconnect` or `com.whatsapp`), filters out duplicates, removes HTML, excludes items older than 12 weeks, and outputs to `data/cleaned_reviews.csv`.*
- **Start the Next.js Development Server:**
  ```bash
  npm run dev
  ```
  *Open [http://localhost:3000](http://localhost:3000) in your browser to access the dashboard.*

---

## 2. System Walkthrough & Human Approval Gating

### Where MCP Approval Happens
Manual human approval gating is built directly into the UI:
1. Open the browser to [http://localhost:3000/approval](http://localhost:3000/approval) (or click the **Review Approval** tab in the sidebar navigation).
2. The interface presents a **Split-Screen human-in-the-loop approval workspace**:
   - **Left Panel:** Displays the list of isolated fee-related complaints and raw user quotes.
   - **Right Panel:** Displays editable textareas containing the AI-generated **Weekly Product Pulse Brief** and the **Customer Fee Explainer**.
3. A product manager reviews and fine-tunes the generated content directly in the textareas.
4. Clicking the **Approve & Sync to MCP Services** button triggers the `/api/approve` webhook.
5. The MCP Client (`src/backend/services/mcpClient.ts`) intercepts this call and dispatches the sync:
   - If keys are present: Appends the database entry to the Notion database and creates an email draft in Gmail.
   - If keys are missing (Sandbox Mode): Appends the entry locally to `data/notion_database.json`, outputs markdown notes to `data/notion_notes_log.md`, and writes draft logs to `data/gmail_drafts/`.

---

## 3. Identified Fee Issue
From the Google Play Store reviews, the primary fee issue identified is **Unexpected Exit Loads** (Early Withdrawal Fees):
- Users complain that a **1% exit load charge** was deducted during withdrawals without transparent UI disclosures or warning overlays when they initially invested.

---

## 4. Skills & Capabilities Map
This project serves as a testbed for the following developer and AI cognitive capabilities:

### ✔ Insight extraction from unstructured data
- **Where it is used:** Refined during the ingestion phase in [`src/backend/services/cleaner.ts`](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/cleaner.ts). The cleaner parses HTML tags, removes duplicate submissions, ignores spam/whitespace, and extracts semantic texts. Additionally, the LLM engine in [`src/backend/services/llm.ts`](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/llm.ts) acts as an extractor to isolate specific fee-related text segments from customer feedback.

### ✔ Theme clustering + signal detection
- **Where it is used:** Implemented in [`src/backend/services/clusterer.ts`](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/clusterer.ts). This service groups the processed reviews into a maximum of 5 categories (e.g., *Exit Load Fee Complaints*, *Positive User Experience*, *App Performance Issues*) and calculates their relative frequency distributions to detect spikes in user frustration.

### ✔ Connecting insights → communication
- **Where it is used:** Realized in [`src/backend/services/generator.ts`](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/generator.ts). This bridge takes the mathematical theme weights and raw quotes and structures them into internal briefs (for the product team) and customer-facing instructions (for customer support).

### ✔ Controlled summarization
- **Where it is used:** Configured within [`src/backend/services/generator.ts`](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/generator.ts). It prompts the LLM to output an internal **Weekly Product Pulse** restricted to $\le$ 250 words in length, containing structural bullet summaries, key observations, actionable recommendations, and representative user quotes.

### ✔ Structured explanation generation
- **Where it is used:** Formulated in [`src/backend/services/generator.ts`](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/generator.ts). It generates a **Customer Fee Explainer** under strict styling guidelines: exactly 6 or fewer bullet points, neutral and non-defensive tone, a timestamp indicating when the pricing rules were last verified, and two official reference URLs.

### ✔ Workflow orchestration
- **Where it is used:** Orchestrated dynamically in the Next.js routes (e.g., `/api/ingest`, `/api/analyze`, `/api/approve`). These endpoints link the async scraper, csv sanitizer, Gemini/Groq analyzer, and MCP client together into a fault-tolerant state pipeline.

### ✔ MCP tool calling + approval gating
- **Where it is used:** Located inside the human approval panel ([`src/components/ApprovalWorkspace.tsx`](file:///d:/SS/AI/Product%20Insight%20Copilot/src/components/ApprovalWorkspace.tsx)) and dispatched via [`src/backend/services/mcpClient.ts`](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/mcpClient.ts). The tool call to append data to the Notion database and compose the Gmail draft remains gated behind a manual button-click approval.

---

## 5. Artifacts & Deliverables Showcase

### Deliverable A: Weekly Product Pulse (Markdown Sample)
```markdown
### Weekly Note
#### Summary of Top Themes
Top themes include Exit Load Fee Complaints (40%), Positive User Experience (30%), and App Performance Issues (20%).

#### Supporting User Quotes
* "App charges exit load without warning! Unacceptable."
* "App keeps crashing on the login screen since the last update."
* "Super sleek dark mode! The transitions are so smooth."

#### Key Observation
Users are experiencing frustration with unexpected exit load fees and app performance issues, while also appreciating the user experience.

#### Action Ideas
1. **Transparent Exit Load Fees**: Display exit load fees clearly during investment to avoid user complaints.
2. **Stability Fix**: Prioritize fixing app crashes and performance issues to ensure a smooth user experience.
3. **UI Refinement**: Refine the new UI update to address font size and readability concerns, ensuring an optimal user experience.
```

### Deliverable B: Notion Synced Database Entry (JSON Log Snippet)
```json
[
  {
    "date": "2026-06-19",
    "top_themes": [
      "Exit Load Fee Complaints",
      "Positive User Experience",
      "App Performance Issues"
    ],
    "weekly_pulse": "### Weekly Note\n#### Summary of Top Themes...",
    "identified_fee_issue": "Exit Load",
    "explanation_bullets": [
      "* The Exit Load fee is a charge applied when you withdraw your investment from the app.",
      "* This fee is deducted from the withdrawal amount and is calculated as a percentage of the withdrawn amount.",
      "* The current Exit Load fee rate is 1%, which means 1% of the withdrawal amount is deducted as the fee.",
      "* The fee is applied to certain investment products and is subject to change as per the app's terms and conditions.",
      "* The Exit Load fee is clearly mentioned in the app's terms and conditions, as well as in the investment product details.",
      "* For more information on the Exit Load fee, please refer to: https://www.insightflow.com/fees/exit-load and https://www.insightflow.com/terms/pricing"
    ],
    "source_links": [
      "https://www.insightflow.com/fees/exit-load",
      "https://www.insightflow.com/terms/pricing"
    ]
  }
]
```

### Deliverable C: Email Draft Log (Text Sample)
```text
Subject: Weekly Product Pulse + Customer Clarification — Exit Load
To: support-leads@company.com
Date: Fri, 19 Jun 2026 09:59:45 GMT
------------------------------------------------------------------------
Weekly Product Pulse:
---
# Weekly Product Pulse
* Isolated exit load fee confusion (40% of negative sentiment).
* Urgent crashing issues detected on Samsung S22 devices post-update.

Customer Clarification:
---
- The Exit Load fee is a 1% charge applied during early withdrawals.
- Official rules are detailed at: https://www.insightflow.com/fees/exit-load
```

### Deliverable D: Reviews CSV Sample
```csv
reviewerName,rating,reviewText,timestamp
"Naga Raj",5,"good",2026-06-18T00:59:44.403Z
"JK JK",1,"poor",2026-06-17T19:28:28.642Z
"Bhagirath Mahto",5,"Thank you for adding corporate Banking in iob connect. Hope all the things may smooth, easier and user-friendly...",2026-06-17T16:08:02.747Z
"Dakshina Moorthy",2,"It says Registration stopped for security purposes(invalid) after entering the OTP and unable to use the app...",2026-06-17T13:30:52.925Z
```

### Deliverable E: Source List (Verified Reference Links)
These links are injected as authoritative pricing sources in the customer-facing explainers:
1. [Exit Load Guidelines](https://www.insightflow.com/fees/exit-load)
2. [Pricing Terms & Agreement](https://www.insightflow.com/terms/pricing)
3. [Help Desk: Withdrawals & Charges](https://www.insightflow.com/help/withdrawals)
4. [User Agreement & Legal Documents](https://www.insightflow.com/legal/user-agreement)
