---
name: Aurora Glass
colors:
  surface: '#131B2E'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
  surface-overlay: '#1E293B'
  border-stroke: '#2E3C5E'
  royal-blue: '#4F46E5'
  deep-teal: '#0D9488'
  emerald-success: '#10B981'
  amber-warning: '#F59E0B'
  text-primary: '#E2E8F0'
  text-muted: '#94A3B8'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  gutter: 24px
  margin-page: 32px
  card-padding: 20px
  sidebar-width: 240px
  header-height: 70px
---

## Brand & Style

The design system is engineered for **InsightFlow**, a high-intelligence B2B tool that demands a balance of developer-centric precision and executive-level sophistication. The brand personality is defined by **trust, technical mastery, and state-of-the-art automation**. It avoids the sterility of standard enterprise software by embracing a "Cyber-Clean" aesthetic that feels both futuristic and grounded.

The chosen design style is **Glassmorphism mixed with High-Contrast Dark Mode**. This approach uses depth and transparency to manage high data density without overwhelming the user. 

- **Minimalism & Depth:** Heavy use of whitespace between glass containers to prevent visual clutter.
- **Glassmorphism:** Surfaces use backdrop blurs and semi-transparent fills to create a layered "command center" feel.
- **Vibrant Data Streams:** Glowing gradients and semantic accents (Teal, Indigo, Rose) act as the primary navigational and informational cues against a "Deep Obsidian" void.
- **Precision Typography:** A mix of geometric headings and monospaced data ensures that insights are legible and authoritative.

## Colors

The color palette, "Deep Obsidian," is optimized for long-duration focus and high-contrast data visualization.

- **Base Background:** `#090D16` serves as the infinite canvas.
- **Glass Surfaces:** Surfaces use `#131B2E` at 60%–70% opacity with a `12px` to `20px` backdrop blur.
- **Action Gradients:** 
    - **Primary (Indigo-Violet):** A linear gradient from `#6366F1` to `#4F46E5`. Used for "Approve" or "Primary Action" states.
    - **Accent (Teal Flow):** A linear gradient from `#06B6D4` to `#0D9488`. Used for data streams and connectivity indicators.
- **Semantic Feedback:**
    - **Rose (#F43F5E):** Reserved for critical alerts, "Reject" actions, and sentiment anomalies.
    - **Amber (#F59E0B):** Used for "Pending" states or warning-level sentiment.
    - **Emerald (#10B981):** Used for "Sync Success" and system health status.

## Typography

The typography system balances high-tech flair with utility.

- **Headings (Outfit):** Used for all display and headline levels. It provides a geometric, modern "Silicon Valley" aesthetic. Large headings should utilize a slight negative letter spacing to feel tighter and more premium.
- **Body (Plus Jakarta Sans):** Chosen for its exceptional legibility in dark mode. It handles the bulk of review text and descriptive content.
- **Data (JetBrains Mono):** This is the "technical soul" of the system. Use it for timestamps, system logs, payload IDs, and any terminal-style input fields. 

**Responsive Note:** On mobile devices, `display-lg` should scale down to `28px` to ensure text doesn't wrap awkwardly in narrow glass cards.

## Layout & Spacing

This design system employs a **12-column flexbox-based grid** optimized for high-density information display.

- **Grid Strategy:** A fluid grid with fixed `24px` gutters. 
- **The Sidebar:** A fixed `240px` left-pinned navigation. It uses a semi-transparent surface (`#131B2E`) to maintain context with the background data flow.
- **Header:** A sticky `70px` header with a high backdrop blur (`20px`) and a `1px` bottom border (`#2E3C5E`) to separate global controls from the workspace.
- **Mobile/Tablet Reflow:** On tablets, the sidebar collapses into an icon-only rail (72px). On mobile, the 12-column grid collapses into a single-column stack with `16px` page margins.
- **Spacing Rhythm:** All spacing should be multiples of the `4px` base unit (e.g., 8, 16, 24, 32).

## Elevation & Depth

Hierarchy is established through **Backdrop Layers** and **Glows** rather than traditional heavy shadows.

- **Tonal Layers:** The base is `#090D16`. Level 1 surfaces (Cards) are `#131B2E` at 60% opacity. Level 2 surfaces (Modals or Hover states) use `#1E293B`.
- **The Glass Effect:** All cards must include `backdrop-filter: blur(12px)`. This prevents background content from making text illegible while maintaining a sense of transparency.
- **Borders:** Every glass container features a `1px` solid border (`#2E3C5E`). For active or "AI-Highlighted" cards, the border should transition to an Indigo-to-Teal gradient.
- **Glow Shadows:** Instead of black shadows, use "Ambient Glows." For primary cards, use `rgba(99, 102, 241, 0.15)` with a `20px` to `30px` blur to simulate a soft neon radiance behind the element.

## Shapes

The shape language is **Rounded (0.5rem / 8px base)**, striking a balance between approachable software and rigid technical tools.

- **Base UI Elements:** Buttons, input fields, and tags use `0.5rem` (8px).
- **Cards (Large Containers):** Use `rounded-lg` (1rem / 16px) to emphasize the "glass pane" metaphor.
- **Buttons:** Primary action buttons can occasionally use `rounded-xl` (1.5rem / 24px) to stand out as "pill-like" interactive objects within a sea of rectangular data.

## Components

### Buttons
- **Primary:** Linear gradient (`#6366F1` to `#4F46E5`). On hover, increase the outer glow (`box-shadow: 0 0 15px rgba(99, 102, 241, 0.4)`).
- **Secondary/Ghost:** `1px` solid border (`rgba(255, 255, 255, 0.1)`). On hover, fill with `rgba(255, 255, 255, 0.05)` and brighten the border.

### Cards & Glass Panes
- **Style:** `rgba(19, 27, 46, 0.7)` background, `12px` blur, `1px` border of `rgba(46, 60, 94, 0.4)`.
- **Special State:** "AI-Insight" cards should feature a pulsing top border gradient using the Indigo/Royal Blue tokens.

### Data Inputs
- **Style:** Background `#090D16` (inset look) with `JetBrains Mono` font for technical values. Focus state should use a Teal (`#06B6D4`) glow.

### Tags & Badges
- **Sentiment Badges:** Use low-opacity fills. For example, a "Rose" alert tag uses `rgba(244, 63, 94, 0.1)` background with `#F43F5E` text.

### Approval Gate Widget
- This is a critical component. It should be a split-view panel within a single large glass card. The "Input" (Left) and "AI Output" (Right) are separated by a subtle vertical divider. The footer of this widget should contain the glowing "Approve & Dispatch" button.

### Live Console Stream
- Items in the console stream should use `JetBrains Mono`. New items should enter with a subtle "fade-in and slide-down" animation to signal real-time activity.