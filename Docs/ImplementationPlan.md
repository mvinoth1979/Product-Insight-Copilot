# Implementation Plan (ImplementationPlan.md)
## Product Name: Product Insight Copilot (InsightFlow)
**Version:** 1.0.0  
**Status:** Initial Draft  
**Target Architecture:** Next.js (TypeScript) + Tailored Tailwind CSS (based on Aurora Glass tokens)  

---

## Handover Protocol
> [!IMPORTANT]
> To maximize context window efficiency and prevent code hallucination, this project is executed across sequential sessions (Sprints).
> At the end of each Sprint, the active agent **MUST** update this document under the **"Sprint Status & Handover Details"** section for that sprint, detailing:
> 1. Completed file paths and functions.
> 2. Current system status (compiling, tests passing, etc.).
> 3. Specific integration points, environment variables, or dependencies added.
> 4. Any blockers or outstanding decisions.

---

## Timeline & Sprint Breakdown

```
                             SPRINT SEQUENCE
┌───────────────────────────────────────────────────────────────────────┐
│ Sprint 1: Review Intelligence Ingestion (Data Cleaner & CSV Prep)     │
│ Sprint 2: Core LLM Pipelines (Gemini/Groq Fallback Reasoning)        │
│ Sprint 3: Aurora Glass Dashboard & Split-Screen UI Components          │
│ Sprint 4: MCP Gated Integration (Notion DB Sync & Gmail Draft API)    │
│ Sprint 5: Gemini Live Streaming API & Real-Time Console               │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Sprint 1: Review Intelligence Ingestion Layer
* **Session Focus:** Set up codebase structure, Google Play Store review scraping script, deduplication, cleaning filter pipelines, and exporting clean reviews to CSV.
* **Target Files:**
  * `[NEW] package.json` (Next.js initialization, core dependencies)
  * `[NEW] src/backend/services/scraper.ts` (Scrapes or simulates scraping reviews for 8-12 weeks)
  * `[NEW] src/backend/services/cleaner.ts` (Deduplication, noise filtering, CSV writer)
  * `[NEW] src/backend/tests/ingestion.test.ts` (Unit test for scraping and cleaning logic)
* **Status:** `[x] Completed`
* **Sprint Status & Handover Details (To be updated at the end of Sprint 1):**
  * *Files Created:*
    * [scraper.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/scraper.ts) - Scrapes/generates mock reviews over a 12-week span.
    * [cleaner.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/cleaner.ts) - Sanitizes HTML, filters out whitespace/duplicates/old entries, and writes to CSV.
    * [ingestion.test.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/tests/ingestion.test.ts) - Unit test suite executing on Node's native runner.
    * [runIngestion.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/scripts/runIngestion.ts) - Ingestion script for trigger commands.
  * *Verification Status:*
    * Next.js build runs cleanly (`npm run build`).
    * Unit tests pass with 100% success (`npm run test`).
    * Structured CSV file output generated at [cleaned_reviews.csv](file:///d:/SS/AI/Product%20Insight%20Copilot/data/cleaned_reviews.csv) containing 11 cleaned, high-relevance reviews (from a raw pool of 16).
  * *Next Steps:*
    * Sprint 2 can ingest the cleaned reviews from [cleaned_reviews.csv](file:///d:/SS/AI/Product%20Insight%20Copilot/data/cleaned_reviews.csv) for clustering.
    * Use these reviews to cluster feedback themes and isolate the "Exit Load" fee charge confusion.
    * Introduce the Gemini SDK (`@google/genai` or `@google/generative-ai`) and Groq API.

---

## Sprint 2: Core LLM Pipelines & Output Generators
* **Session Focus:** Implement theme clustering, fee isolation, and generate both the Weekly Product Pulse (≤250 words) and Fee Explainer (≤6 bullets, facts-only, links). Build Gemini API wrapper with Groq API fallback routing.
* **Target Files:**
  * `[NEW] src/backend/services/llm.ts` (Gemini API config + Groq SDK fallback routing)
  * `[NEW] src/backend/services/clusterer.ts` (Reviews clustering + quote extractor)
  * `[NEW] src/backend/services/generator.ts` (Pulse & Explainer prompt configurations)
  * `[NEW] src/backend/tests/generator.test.ts` (Integration tests for structured generation)
* **Status:** `[x] Completed`
* **Sprint Status & Handover Details (To be updated at the end of Sprint 2):**
  * *Files Created:*
    * [llm.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/llm.ts) - Interfaces with Google Gemini SDK (`@google/genai`) and falls back to Groq (`groq-sdk`) under failures or force triggers. Wraps calls in a mockable object export.
    * [clusterer.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/clusterer.ts) - Ingests CSVs and prompts the LLM to output a structured JSON category breakdown.
    * [generator.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/generator.ts) - Formats summaries for the Weekly Pulse and bullet lists for the Fee Explainer.
    * [generator.test.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/tests/generator.test.ts) - Verifies JSON outputs, length limits, and Groq fallback.
  * *Verification Status:*
    * Tests compile and run: 9/9 tests pass (`npm run test`).
    * ESLint warning check: 0 errors and 0 warnings (`npm run lint`).
    * Successful package installation of `@google/genai` and `groq-sdk`.
  * *Next Steps:*
    * In Sprint 3, build the frontend UI dashboard and human-approval layout.
    * Load review results via backend hooks. Connect components to endpoints that invoke `clusterReviewsFromCSV` and `generator.ts` helpers.
    * Use CSS variables mapped in [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md) for style tokens.

---

## Sprint 3: Aurora Glass Dashboard & Split-Screen UI
* **Session Focus:** Realize the design system from `Docs/DESIGN.md`. Build the main Dashboard layout, Review table list, and Split-screen Human-in-the-Loop approval workspace.
* **Target Files:**
  * `[NEW] src/app/globals.css` (Tailwind / CSS variables matching Aurora Glass design tokens)
  * `[NEW] src/app/layout.tsx` (Overall Layout, Sidebar, Top Sticky Header)
  * `[NEW] src/app/page.tsx` (Main Dashboard view showing review table, theme stats, isolated fee card)
  * `[NEW] src/components/ApprovalWorkspace.tsx` (Split panel view: left side reviews, right side editable pulse/explainer markdown blocks)
* **Status:** `[x] Completed`
* **Sprint Status & Handover Details (To be updated at the end of Sprint 3):**
  * *Files Created:*
    * [globals.css](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/globals.css) - Configures color variables and design tokens matching [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md) for Tailwind CSS v4, along with scrollbar and `.glass-panel` utilities.
    * [Sidebar.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/components/Sidebar.tsx) & [Header.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/components/Header.tsx) - Responsive navigation bar and dynamic heading header showing engine status and refresh actions.
    * [layout.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/layout.tsx) - Binds the vertical layout using Outfit and Plus Jakarta Sans fonts from Google Fonts.
    * [page.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/page.tsx) - Dashboard showing reviews ingested, rating, isolated exit load card, and review list table.
    * [ApprovalWorkspace.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/components/ApprovalWorkspace.tsx) & [page.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/approval/page.tsx) - Split panel layout displaying complaints on the left and editable Weekly Pulse and Fee Explainer textareas on the right with bottom action bar.
    * [console/page.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/console/page.tsx) & [settings/page.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/settings/page.tsx) - Custom mock dashboard screens to prevent 404 navigation and configure credentials.
    * API Routes: `api/ingest`, `api/reviews`, `api/analyze`, `api/approve` - Endpoints returning review lists, categories, and handles webhook approvals.
  * *Verification Status:*
    * Next.js build runs and outputs static/dynamic pages cleanly (`npm run build`).
    * ESLint warning check: 0 errors and 0 warnings (`npm run lint`).
    * Local unit tests pass successfully (`npm run test`).
  * *Next Steps:*
    * In Sprint 4, implement the Model Context Protocol (MCP) clients and handlers.
    * Intercept `/api/approve` POST calls and write live database updates to Notion and create draft emails in Gmail.
    * Connect credentials configured in the Settings page to environmental variables inside the MCP clients.

---

## Sprint 4: MCP Gated Integration
* **Session Focus:** Build the approval-gated Model Context Protocol (MCP) clients and handlers. Implement database writing (Notion/Google Docs sync) and Gmail draft drafting.
* **Target Files:**
  * `[NEW] src/backend/services/mcpClient.ts` (MCP gateway handling tool calls post-approval)
  * `[NEW] src/app/api/approve/route.ts` (API endpoint handling approval requests, triggering Notion & Gmail drafts)
  * `[NEW] src/app/settings/page.tsx` (MCP connection settings, credential inputs, health indicator)
* **Status:** `[x] Completed`
* **Sprint Status & Handover Details (To be updated at the end of Sprint 4):**
  * *Files Created:*
    * [mcpClient.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/mcpClient.ts) - Handles Notion sync and Gmail API draft creation with automated fail-safes writing back to local files (JSON, Markdown log, and raw text drafts).
    * [settings/page.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/settings/page.tsx) - Interactive dashboard interface to insert API keys, Notion database IDs, and Gmail credentials. Connects to test endpoints and renders connection health pings.
    * [approve/route.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/api/approve/route.ts) - POST webhook parser extracting final approved texts, bullet logs, and hyperlinks to trigger Notion/Gmail syncs.
    * [settings/route.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/api/settings/route.ts) & [test-connection/route.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/api/test-connection/route.ts) - Backend validation endpoints verifying Gemini/Groq keys, Notion pings, and OAuth pings.
    * [runApprovalSim.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/scripts/runApprovalSim.ts) - Sandbox end-to-end webhook execution testing script.
  * *Verification Status:*
    * Local Sandbox integration works: running the sync simulator outputs correct JSON payloads and email drafts in local data folders.
    * NPM packages `@notionhq/client` and `googleapis` successfully installed and integrated.
    * Production compiler runs successfully (`npm run build`).
    * ESLint warning check: 0 errors and 0 warnings (`npm run lint`).
  * *Next Steps:*
    * In Sprint 5, integrate the Gemini Live API for real-time review parsing.
    * Set up WebSockets client to listen to reviews and trigger automated warnings.
    * Build the Live Console UI dashboard and charts inside `/console`.

---

## Sprint 5: Gemini Live Streaming API & Final Polish
* **Session Focus:** Upgrade review processing to support streaming inputs via Gemini Live API (WebSockets) and real-time dashboard notifications. Final E2E system check and handover cleanup.
* **Target Files:**
  * `[NEW] src/backend/services/streamer.ts` (WebSocket client listening to review feeds + Gemini Live API connector)
  * `[NEW] src/app/console/page.tsx` (Live console stream UI with real-time sentiment charts and terminal inputs)
  * `[NEW] src/backend/tests/e2e.test.ts` (Full end-to-end integration test)
* **Status:** `[x] Completed`
* **Sprint Status & Handover Details (To be updated at the end of Sprint 5):**
  * *Files Created:*
    * [streamer.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/services/streamer.ts) - Manages WebSocket streaming simulations, sliding-window complaint counts, and surge alerts.
    * [stream/route.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/api/stream/route.ts) - Server-Sent Events (SSE) stream server pushing live events to the client on triggers.
    * [console/page.tsx](file:///d:/SS/AI/Product%20Insight%20Copilot/src/app/console/page.tsx) - Interactive dashboard with play/pause triggers, logs terminal, keyword filtering, and alert boards.
    * [e2e.test.ts](file:///d:/SS/AI/Product%20Insight%20Copilot/src/backend/tests/e2e.test.ts) - Multi-phase integration test verifying the entire product flow: scraping, cleaning, LLM categorizations, copying limits, MCP Notion/Gmail local syncs, and real-time streaming anomaly alarms.
  * *Verification Status:*
    * Full E2E test runs successfully with all checks passing: 14/14 tests pass (`npm run test`).
    * Linter compliance: 0 errors and 0 warnings (`npm run lint`).
    * Product compile: successfully compiled (`npm run build`).
  * *Next Steps (Production Launch):*
    * **Development server:** Spin up local dashboard using `npm run dev`. Connect browser to `http://localhost:3000`.
    * **Ingestion:** Populate clean database by executing `npm run ingest`.
    * **Live API Keys:** To switch out of Sandbox local simulation, append `GEMINI_API_KEY`, `GROQ_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN` variables to `.env.local` file at the root.
