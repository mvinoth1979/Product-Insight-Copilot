# Stitch UI Generation Prompts (DESIGN_PROMPTS.md)
## Product Name: Product Insight Copilot (InsightFlow)
**Design System Reference:** [DESIGN.md](file:///d:/SS/AI/Product%20Insight%20Copilot/Docs/DESIGN.md)  
**Target:** Google's Stitch UI Generation Tool  

Below are the detailed prompt blocks optimized for Google's Stitch. Each prompt specifies visual assets, layouts, typography, exact hex colors, and interaction requirements.

---

## Screen 1: Dashboard / Review Intelligence Hub
```
[PROMPT START]
Design a premium Web Dashboard for "InsightFlow - Product Insight Copilot".
Primary Theme: Dark Mode with deep obsidian background (#090D16).
Layout: Left-pinned vertical navigation sidebar (240px width, #131B2E, translucent with 1px border #2E3C5E on the right) with menu items: Dashboard, Review Approval, Live Console, and Settings. 

Top Header: 70px height, semi-transparent backdrop blur, showing the page title "Review Intelligence Hub" in Outfit font (24px, bold) and a status badge on the right reading "Primary Engine: Gemini 1.5 Flash" in Emerald Green text (#10B981) with a soft green pulsing glow dot.

Main Workspace Layout: 
1. Top Row (3 Grid Cards):
   - Card 1: Total Reviews Parsed (e.g., "12,408" in Outfit 36px font, with a +12% label in green, and a miniature linear area sparkline using Teal #06B6D4 gradient).
   - Card 2: Top Active Theme (e.g., "Pricing Confusion" in Bold 18px Outfit, with a warning tag #F59E0B and a mini pie chart showing it represents 42% of reviews).
   - Card 3: Integration Health (e.g., "MCP Status: Active" in Emerald Green, showing connected icons for Notion and Gmail).

2. Middle Section (Two-Column Layout: 8 cols / 4 cols):
   - Left Column (8 cols): A clean, high-density table showing "Recent Ingested Reviews". Columns: Date, Rating (rendered as 1-5 filled yellow stars #F59E0B), Raw Review (truncate to 80 chars, Plus Jakarta Sans), Detected Sentiment (bubble badge color-coded: red, amber, green), and Actions button (ghost style). Table background is #131B2E with a 12px blur, and rows hover-highlight with background #1E293B.
   - Right Column (4 cols): A glowing card titled "Recurring Fee Issue Isolated" with an indigo-purple gradient border. It displays:
     * Large alert badge: "Issue: Exit Load Confusion" in Rose pink (#F43F5E).
     * Brief summary description: "Users are reporting unexpected charges when withdrawing mutual fund investments before the lock-in period."
     * A CTA button at the bottom: "Generate Explainer & Sync" with a pulsing Indigo to Royal Blue gradient background (#6366F1 ➔ #4F46E5) and white text.
[PROMPT END]
```

---

## Screen 2: Human-in-the-Loop Approval Workspace
```
[PROMPT START]
Design a high-fidelity, split-screen desktop workspace interface for the review and approval step of "InsightFlow".
Theme: Cyber-clean dark mode, base #090D16, card structures #131B2E.
Typography: Outfit for headings, JetBrains Mono for system payloads, Plus Jakarta Sans for input fields and body text.

Screen Layout: Split 50/50 vertically down the middle with a divider line (#2E3C5E).

Left Panel (Input Context):
- Title: "Raw Signal Context - Exit Load Complaints" in Outfit (18px, SemiBold).
- Inside is a scrollable feed of 3 stylized review cards. Each card has a semi-transparent base, a 1-star indicator, and italicized quotes:
  * Quote 1: "I withdrew my funds after 6 months and was charged exit load fees. Your app didn't show this anywhere during deposit!"
  * Quote 2: "Where are the pricing terms hidden? Got charged 1% exit fees without notification."
  * Quote 3: "Exit loads are a scam. Make your terms clear."
- Highlight the words "exit load", "fees", and "charged" in soft glowing Rose text (#F43F5E) using a neon highlighter effect.

Right Panel (Generated Outputs Editor):
- Title: "AI-Drafted Outputs (Gemini 1.5 Pro)" in Outfit (18px, SemiBold).
- Underneath, present two editable document cards:
  1. Box 1: "Weekly Product Pulse (Internal)" - A markdown-rendered editor pane containing a title, summary list of themes, and 3 bullet action points. It has a toolbar with format options (B, I, Link).
  2. Box 2: "Customer-Facing Fee Explainer" - An editable bullet-point card with 4 neat bullet points explaining the exit load rules, containing 2 hyperlinked text items (in Teal #06B6D4) and a footer "Last Checked: 2026-06-19" in JetBrains Mono code font.

Bottom Action Bar: 
- Sticky footer across the screen, translucent dark backplane (#090D16 at 90% opacity) with backdrop-filter blur.
- Align Left: "Discard Draft" button (ghost/outline style with red border on hover).
- Align Right: "Edit Prompt" secondary button next to a prominent primary action button: "Approve & Dispatch via MCP". The button has an active glowing Green gradient (#10B981) background, bold white text, and an icon representing a sync checkmark. Clicking it shows a subtle progress spinner.
[PROMPT END]
```

---

## Screen 3: Live Review Console (Gemini Live Stream)
```
[PROMPT START]
Design a real-time monitor console screen for "InsightFlow".
Theme: Ultra-dark mode, grid system layout, base #090D16. Accent colors: Electric Teal (#06B6D4) and Indigo (#6366F1).

Top Section:
- Grid layout with a live network map or data flow indicator representing connection state: "Gemini Live Websocket: Connected" (pulsing teal indicator dot).
- Charts: 2 side-by-side dark-themed charts. Left chart is a real-time sentiment stream chart (line chart scrolling right to left, showing Red/Green/Yellow lines). Right chart is a bar chart tracking "Hourly Billing Complaints".

Bottom Section:
- Component: "Real-time Review Stream". Designed to look like a clean developer console mixed with a chat UI.
- New reviews stream down from the top. Each stream item has:
  * A time stamp (e.g., "14:45:21", in JetBrains Mono, gray #64748B).
  * The reviewer name and App version.
  * Rating badge.
  * Review message.
  * An AI annotation badge on the right: e.g. "Analyzing..." (pulsing teal glow) turning into "Clustered: Exit Load Confusion" (red tag #F43F5E) or "No Action Needed" (faded gray).
- Include terminal-style inputs at the bottom: "Set Stream Alert Filters..." where users can type keywords to filter the live WebSocket feed.
[PROMPT END]
```

---

## Screen 4: MCP Integration & Settings
```
[PROMPT START]
Design the Settings and Integration panel for "InsightFlow".
Theme: Deep Obsidian dark theme (#090D16), clean and spacious layout.
Layout: 12-column grid.

Left Section (4 cols):
- Vertical tab list: "General Settings", "LLM Configuration", "MCP Connections", "Webhooks". Active tab is "MCP Connections", styled with an indigo left-border indicator.

Right Section (8 cols):
- Header: "Model Context Protocol (MCP) Integrations" in Outfit (20px, SemiBold).
- Underneath, present 3 integration cards:
  1. Card 1: Notion Sync Tool.
     * Content: Notion icon, database name "Product Feedback Backlog", status indicator "CONNECTED" (green). Toggle button to disconnect. A test connection button.
  2. Card 2: Gmail Draft Creator.
     * Content: Gmail icon, target draft box user "support-leads@company.com", status indicator "CONNECTED" (green). Toggle to turn on/off automatic subject prepending.
  3. Card 3: Custom Play Store Crawler.
     * Content: Google Play Console API configuration panel, upload area for CSV fallback files, crawler interval dropdown selector (Every 24h, 12h, 1h, Realtime).
- Bottom Action Area: 
  - LLM fallback selector group: Radio card choice between "Gemini 1.5 Flash (Primary) + Groq Llama-3 (Fallback)" and "Groq Llama-3 (Primary) only".
  - Large button: "Save & Reload Server" (Indigo background #6366F1).
[PROMPT END]
```
