# Design Specifications (DESIGN.md)
## Product Name: Product Insight Copilot (InsightFlow)
**Design System Version:** 1.0.0 (Codename: *Aurora Glass*)  
**Target Platform:** Web (Responsive Desktop & Tablet Optimization)  
**Primary Theme:** Premium, High-Density Dark Mode (Glassmorphic & Cyber-Clean)  

---

## 1. Visual Voice & Brand Personality
The Product Insight Copilot is a developer-friendly, intelligence-driven, and automation-first B2B tool. The UI should project **trust, precision, and state-of-the-art capability**.
* **Visual Style:** Sleek dark-mode, clean borders, high data density, semantic feedback states, and elegant glowing gradients that draw focus to AI insights.
* **Avoid:** Plain grey boxes, flat white spreadsheets, over-saturated cartoonish color combinations, and overly playful font faces.

---

## 2. Color System & Tokens
We utilize a primary Dark Theme called **Deep Obsidian** with glassmorphic accents.

```
       DEEP OBSIDIAN BRAND COLOR SYSTEM (DARK MODE DEFAULT)
┌───────────────────────────────────────────────────────────────┐
│  Primary (Indigo-Violet):   #6366F1 ➔ #4F46E5                 │
│  Accent (Teal Flow):        #06B6D4 ➔ #0D9488                 │
│  Base Background:           #090D16                           │
│  Surface Card:              #131B2E (Semi-transparent / Blur) │
│  Border Stroke:             #2E3C5E (Reflective Subtlety)     │
│  Semantic Rose (Alert):     #F43F5E                           │
└───────────────────────────────────────────────────────────────┘
```

### 2.1 Theme Tokens
* **Base Background:** `#090D16` (Deep Space Dark)
* **Surface Background:** `#131B2E` (Semi-transparent with 60% opacity for glassmorphism)
* **Surface Overlay:** `#1E293B` (Used for hover states, dropdown list items)
* **Borders & Dividers:** `#2E3C5E` with `rgba(46, 60, 94, 0.4)` for inactive states; linear gradient border for active highlights.
* **Glow/Shadow Accent:** `rgba(99, 102, 241, 0.15)` (Soft purple drop-shadow blur of 20px)

### 2.2 Functional & Semantic Colors
* **Primary (AI Reasoning):** `#6366F1` (Indigo) to `#4F46E5` (Royal Blue) Gradient
* **Accent (Data Pipelines/Active Streams):** `#06B6D4` (Teal) to `#0D9488` (Deep Teal) Gradient
* **Success (Approved/Synced):** `#10B981` (Emerald)
* **Warning (Under Review/Awaiting Action):** `#F59E0B` (Amber)
* **Error (Critical Fee Confusion/System Down):** `#F43F5E` (Rose)

---

## 3. Typography & Hierarchy
For the premium look, we recommend importing fonts from Google Fonts:
* **Headings / Accent Text:** `Outfit` (Modern, geometric, high-tech personality)
* **Body / Readability / Code:** `Plus Jakarta Sans` (Clean, highly legible at small sizes) & `JetBrains Mono` (for data lists and payload view)

```
        TYPOGRAPHY MATRIX
┌───────────┬──────────────┬───────────────┬───────────────────────────┐
│ Style     │ Font Family  │ Size          │ Weight & Details          │
├───────────┼──────────────┼───────────────┼───────────────────────────┤
│ Display 1 │ Outfit       │ 36px / 2.25rem│ Bold (700), -0.02em track  │
│ Heading 2 │ Outfit       │ 24px / 1.5rem │ SemiBold (600), Gradient  │
│ Subhead 1 │ Outfit       │ 18px / 1.1rem │ Medium (500), #94A3B8     │
│ Body Text │ Jakarta Sans │ 14px / 0.87rem│ Regular (400), #E2E8F0    │
│ Data/Mono │ JetBrains    │ 12px / 0.75rem│ Regular (400), Light Gray │
└───────────┴──────────────┴───────────────┴───────────────────────────┘
```

---

## 4. Layout, Grid, & Elevation

### 4.1 Layout Framework
* **Grid:** 12-column flexbox-based grid system with `24px` gaps.
* **Navigation:** Left-pinned vertical navigation sidebar (width: `240px`), expanding or collapsing with a smooth transition.
* **Header:** Sticky top header (height: `70px`), with backdrop-filter blur (`20px`) and bottom border dividing the dashboard workspace.

### 4.2 Elevation & Glassmorphism Details
To achieve a premium "glass" layer effect:
* **Cards:**
  ```css
  background: rgba(19, 27, 46, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(46, 60, 94, 0.4);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  ```

---

## 5. UI Components & Interaction States

### 5.1 Interactive Buttons
1. **Primary Button:** 
   * *Idle:* Indigo to Royal Blue gradient background, white text.
   * *Hover:* Shift gradient angle or increase glow effect (`box-shadow: 0 0 15px rgba(99, 102, 241, 0.4)`).
   * *Transition:* `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.
2. **Secondary/Ghost Button:**
   * *Idle:* Translucent fill (`rgba(255, 255, 255, 0.05)`), border `1px solid rgba(255, 255, 255, 0.1)`.
   * *Hover:* White text, border `1px solid rgba(255, 255, 255, 0.3)`.
3. **Approval Action Button:**
   * *Approved Action:* Emerald Green outline with glowing background on hover.
   * *Reject Action:* Rose outline with warning glow on hover.

### 5.2 Review & Theme Cards
* **Header Section:** Theme badge (e.g., `[Pricing Confusion]`) utilizing tag styling.
* **Tag Styling:**
  * Background: `rgba(244, 63, 94, 0.1)`
  * Text Color: `#F43F5E`
  * Border: `1px solid rgba(244, 63, 94, 0.2)`
* **Quote Elements:** Render in blockquotes with left border indicator (`2px` solid `#6366F1`), font-style italic, text color `#94A3B8`.

### 5.3 Approval Gate Widget (Critical System Component)
* **Visual Anchor:** Placed in the center of the viewport or as a floating panel on the right.
* **Layout:** Splitted layout with left side representing raw input (recent user complaints) and right side representing LLM-generated output (Weekly Pulse + Fee Explainer).
* **Action Footer:** "Approve Sync to Notion & Gmail Draft" with a large, glowing button that shows loading spinner once clicked.
