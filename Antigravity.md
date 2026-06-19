# Antigravity Developer Guide (Antigravity.md)

This file instructs the Antigravity AI coding agent on project patterns, constraints, and architecture. Keep edits to this file minimal and brief to preserve context window capacity.

---

## 1. Core Stack & APIs
* **Framework:** Next.js (TypeScript, App Router, Tailwind CSS).
* **AI Orchestration:** Google Gemini API (Primary) with Groq API SDK (Fallback).
* **Real-time Pipeline:** Gemini Live API (WebSockets) in `src/backend/services/streamer.ts`.
* **Integrations:** Model Context Protocol (MCP) for appending records (Notion/Docs) and creating email drafts (Gmail).

---

## 2. Key Architecture Rules
* **Strict Human Approval Gate:** No MCP action (Notion sync, Gmail draft) can run automatically. A manual approval webhook request to `/api/approve` is mandatory.
* **UI Design System:** Conform to tokens and layout constraints in [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md).
* **Response Constraints:** Weekly Product Pulse (≤250 words, markdown); Fee Explainer (≤6 bullets, facts-only, 2 official source links, date stamp).

---

## 3. Directory Layout
* `/Docs` - Project requirements, designs, multi-sprint plan, and session starts.
* `/Design` - Stitch UI mockups, templates, and screen assets.
* `/src/app` - Next.js UI Pages and App Router API endpoints.
* `/src/backend` - Review ingestion, cleaning, LLM pipelines, and MCP clients.
* `/src/backend/tests` - Ingestion, generation, and E2E integration test suites.

---

## 4. Multi-Session Handover Rule
At the end of any work session, the active agent **MUST** update [ImplementationPlan.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/ImplementationPlan.md):
1. Mark the active sprint as `[x] Completed` or update to `[/] In Progress`.
2. Populate the **"Sprint Status & Handover Details"** for the active sprint (created files, functionality, environment configurations, and verified tests).
3. Ensure all unit and integration tests compile before finishing.
