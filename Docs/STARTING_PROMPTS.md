# Starting Prompts (STARTING_PROMPTS.md)
## Product Name: Product Insight Copilot (InsightFlow)

Use the following prompt blocks to initialize each session. Copy and paste the corresponding text block to start a new sprint session.

---

### Sprint 1: Review Intelligence Ingestion Layer
```
[PROMPT START]
You are starting Sprint 1 (Session 1) of the InsightFlow Product Insight Copilot project.

Your objective in this session is to build the baseline codebase structure and the Ingestion & Cleaning Layer.
Before writing any code:
1. Read the Product Requirement Document: [PRD.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/PRD.md)
2. Read the Design System Spec: [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md)
3. Read the Implementation Plan: [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md)

Your tasks in this session are:
1. Initialize the codebase in the current workspace directory. Set up a Next.js (TypeScript) application. Use `npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (ensure you run with --help or configure it to run in a non-interactive mode).
2. Create a mock Google Play Store review scraping service in `src/backend/services/scraper.ts`. It should generate or fetch public reviews covering the last 8-12 weeks, containing reviewer name, rating (1-5), review text, and timestamp.
3. Build the sanitization and cleaning module in `src/backend/services/cleaner.ts`. It must:
   - Filter out duplicate reviews, empty/whitespace strings, and reviews older than 12 weeks.
   - Clean the text inputs (strip HTML/unsupported characters).
   - Write the cleaned reviews out to a structured CSV file (`data/cleaned_reviews.csv`).
4. Write a unit test `src/backend/tests/ingestion.test.ts` to verify the scraper generates data and the cleaner correctly filters duplicates/old reviews. Verify it runs via `npm run test` or a custom test runner script.

Critical Handover Requirement:
When you have successfully built and verified this sprint's features:
- Open [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md).
- Update Sprint 1's status from `[ ] Pending` to `[x] Completed`.
- Under the "Sprint Status & Handover Details" section for Sprint 1, document the files you created, functions built, testing results, and any context or environment variables needed for Sprint 2.
[PROMPT END]
```

---

### Sprint 2: Core LLM Pipelines & Output Generators
```
[PROMPT START]
You are starting Sprint 2 (Session 2) of the InsightFlow Product Insight Copilot project.

Your objective in this session is to build the LLM Theme Clustering, Fee Isolation, and Pulse/Explainer generative pipelines.
Before writing any code:
1. Read the Product Requirement Document: [PRD.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/PRD.md)
2. Read the Design System Spec: [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md)
3. Read the Implementation Plan: [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md). Pay close attention to the "Sprint Status & Handover Details" written for Sprint 1.

Your tasks in this session are:
1. Implement the LLM API module in `src/backend/services/llm.ts`. Use the Google Gemini API (via `@google/genai` or `@google/generative-ai`) as the primary model. Build a robust fallback configuration: if the Gemini API fails, rate-limits, or times out, catch the error and route the payload to the Groq API (using the Groq SDK or HTTP requests).
2. Create the semantic clustering engine in `src/backend/services/clusterer.ts`. Ingest the cleaned reviews CSV generated in Sprint 1, cluster them into a maximum of 5 distinct themes, extract the top 3 themes, find 3 representative user quotes for each, and isolate 1 recurring complaint related to a specific fee/charge.
3. Build the Generator in `src/backend/services/generator.ts` to output:
   - Weekly Product Pulse: ≤250-word structured markdown summary of top themes, quotes, observations, and 3 actionable ideas.
   - Fee Explainer: ≤6 bullet points in a facts-only tone, detailing the isolated fee, with 2 official source links and a "Last checked" date.
4. Write integration tests in `src/backend/tests/generator.test.ts` to mock review datasets and verify that the LLM generates structured outputs within the word and bullet limits, and that fallback routing to Groq succeeds when Gemini is disabled.

Critical Handover Requirement:
When you have successfully built and verified this sprint's features:
- Open [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md).
- Update Sprint 2's status from `[ ] Pending` to `[x] Completed`.
- Under the "Sprint Status & Handover Details" section for Sprint 2, document the files you created, prompts used, model settings, test outcomes, and integration instructions for the frontend in Sprint 3.
[PROMPT END]
```

---

### Sprint 3: Aurora Glass Dashboard & Split-Screen UI
```
[PROMPT START]
You are starting Sprint 3 (Session 3) of the InsightFlow Product Insight Copilot project.

Your objective in this session is to design and implement the user interface according to the visual design tokens and screen mocks.
Before writing any code:
1. Review the Design Spec: [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md)
2. Review the Stitch-generated UI structures in the `Design/` folder (such as the HTML/CSS and screenshot materials).
3. Read the Implementation Plan: [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md). Read the handover details for both Sprint 1 and Sprint 2.

Your tasks in this session are:
1. Configure Tailwind CSS variables in `src/app/globals.css` using the "Aurora Glass" design tokens (Obsidian `#090D16`, semi-transparent cards `#131B2E` with 12px blur, indigo-violet and teal gradients, Outfit and Plus Jakarta Sans fonts).
2. Code the master app layout in `src/app/layout.tsx` including the sticky header and the vertical navigation sidebar (Dashboard, Review Approval, Live Console, Settings).
3. Build the Dashboard page in `src/app/page.tsx` showing the ingestion metrics, ratings distribution, sentiment bubbles, the cleaned reviews table, and the isolated fee card widget.
4. Implement the Human-in-the-Loop split panel in `src/components/ApprovalWorkspace.tsx` and place it in the navigation under "Review Approval":
   - Left Panel: Scrollable list of complaints related to the isolated fee.
   - Right Panel: Editable markdown textareas for the AI-generated Weekly Pulse and the Fee Explainer.
   - Bottom Action Bar: "Discard Draft" and glowing green/blue "Approve & Dispatch" buttons.
5. Create frontend-to-backend integration hooks to load review lists and trigger AI generation on mount. Ensure app builds cleanly via `npm run build`.

Critical Handover Requirement:
When you have successfully built and verified this sprint's features:
- Open [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md).
- Update Sprint 3's status from `[ ] Pending` to `[x] Completed`.
- Under the "Sprint Status & Handover Details" section for Sprint 3, document the files you created, component layouts, local dev testing steps, and API endpoint expectations for the MCP integration in Sprint 4.
[PROMPT END]
```

---

### Sprint 4: MCP Gated Integration
```
[PROMPT START]
You are starting Sprint 4 (Session 4) of the InsightFlow Product Insight Copilot project.

Your objective in this session is to build the MCP integration system and the approval gating logic.
Before writing any code:
1. Read the Product Requirement Document: [PRD.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/PRD.md)
2. Read the Design System Spec: [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md)
3. Read the Implementation Plan: [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md). Review the handover details for Sprint 1, 2, and 3.

Your tasks in this session are:
1. Build the MCP backend connector client in `src/backend/services/mcpClient.ts`. It must interface with Notion API (or Google Docs) to append structured JSON entries, and Gmail SMTP/Draft API to create email drafts (Subject: Weekly Product Pulse + Customer Clarification — [Fee], Body: Pulse + Explainer).
2. Set up the Next.js API route `src/app/api/approve/route.ts` which handles the approval webhook. It should require human approval input from the frontend before executing the Notion/Google Doc sync and Gmail draft creation.
3. Build the Settings configuration page in `src/app/settings/page.tsx` where users can toggle primary/fallback models (Gemini vs Groq), update API keys, manage credentials for Notion/Gmail, and test connection health indicators.
4. Verify the end-to-end approval flow: clicking "Approve & Dispatch" in the UI sends requests to `/api/approve`, which successfully appends to the database and creates the mail draft.

Critical Handover Requirement:
When you have successfully built and verified this sprint's features:
- Open [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md).
- Update Sprint 4's status from `[ ] Pending` to `[x] Completed`.
- Under the "Sprint Status & Handover Details" section for Sprint 4, document the files you created, API configuration details, MCP integration setup guides, and instructions for streaming alerts in Sprint 5.
[PROMPT END]
```

---

### Sprint 5: Gemini Live Streaming API & Final Polish
```
[PROMPT START]
You are starting Sprint 5 (Session 5) of the InsightFlow Product Insight Copilot project.

Your objective in this session is to upgrade the review intelligence engine to support real-time streaming reviews via Gemini Live API (WebSockets), build the stream monitor page, and run end-to-end integration tests.
Before writing any code:
1. Read the Product Requirement Document: [PRD.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/PRD.md)
2. Read the Design System Spec: [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md)
3. Read the Implementation Plan: [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md). Review the handover details for all previous Sprints.

Your tasks in this session are:
1. Implement the streaming review consumer in `src/backend/services/streamer.ts` utilizing the Gemini Live API over WebSockets. Establish a listener that parses live-streamed review strings and runs an anomaly detector that alerts if fee/billing complaint occurrences cross a configured frequency threshold (e.g. 5 occurrences/hour).
2. Build the Live Console UI dashboard in `src/app/console/page.tsx` including a connection status panel (green pulsing indicator), a rolling console list showing incoming reviews, and a line graph tracking real-time sentiment shifts.
3. Add search keyword filters to the console page allowing users to narrow down the live stream.
4. Create a comprehensive end-to-end test script `src/backend/tests/e2e.test.ts` checking ingestion, LLM clustering, approval gating, and MCP routing.
5. Clean up any linting errors, compile and package the app for production, and verify all code paths.

Critical Handover Requirement:
When you have successfully built and verified this sprint's features:
- Open [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md).
- Update Sprint 5's status from `[ ] Pending` to `[x] Completed`.
- Under the "Sprint Status & Handover Details" section for Sprint 5, write the final summary of the system, verify all unit and integration tests are passing, and provide instructions on how to start the app in production mode.
[PROMPT END]
```
