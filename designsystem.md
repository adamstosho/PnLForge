DeriverseUI — Complete Design System (production grade)

Below is a detailed, implementation-ready design system crafted for the Deriverse Trading Analytics Dashboard & Journal. It is practical, modern, mobile friendly and ready to hand to frontend engineers and designers. Every choice is deliberate: accessible colour contrast, a robust token scale, clear component behaviour, responsive rules and coded examples you can drop straight into a Tailwind or CSS variables workflow. I used proven patterns from top apps and adapted them to a unique, non-generic identity that will feel handcrafted.

If you want, I can convert these tokens to a Figma file, provide Tailwind config ready to paste, or produce React components following these specs.

1. Brand and visual direction

Name: DeriverseUI

Essence: Professional, precise, calm. The design conveys trust and data clarity for serious traders while remaining friendly enough for learners.

References and inspiration: TradingView for charts clarity, Notion for minimalism and readable interfaces, Stripe Dashboard for layout and polish, and Linear for motion and microinteraction quality.

Tone of copy and microcopy: Precise, concise, human. Use short instructional sentences. Use active voice. Example: "Export CSV" not "CSV Export".

2. Design tokens

All values are provided as CSS variables and a matching Tailwind theme mapping. Use them as single source of truth.

2.1 Colour tokens (hex)

Primary palette

--color-primary-50:  #f3fbff
--color-primary-100: #e6f7ff
--color-primary-200: #bfeeff
--color-primary-300: #7fdcff
--color-primary-400: #33c9ff
--color-primary-500: #0aaadf   /* primary brand colour */
--color-primary-600: #078fb6
--color-primary-700: #05607f
--color-primary-800: #03434d
--color-primary-900: #012428


Accent and neutrals

--color-accent-1:  #7b5cff   /* energetic accent */
--color-success:   #16a34a
--color-danger:    #ef4444
--color-warning:   #f59e0b
--color-muted-100: #f6f7f9
--color-muted-200: #eef1f5
--color-muted-300: #dbe3ee
--color-muted-400: #aebed0
--color-muted-500: #7b8898
--color-muted-600: #5a6673
--color-muted-700: #3b434b
--color-bg:        #ffffff
--color-surface:   #fcfdff
--color-overlay:   rgba(3, 6, 23, 0.6)  /* modal overlay */


Data visualisation semantic colours (colourblind friendly)

--color-profit:    #16a34a
--color-loss:      #ef4444
--color-neutral-1: #0aaadf
--color-neutral-2: #7b5cff
--color-heat-1:    #fee8d6
--color-heat-2:    #fdbb84
--color-heat-3:    #fc8d59
--color-heat-4:    #e34a33


Ensure contrast:

Primary 500 on bg must pass WCAG AA for text larger than 14 px. Use 700 or 800 for small body text to satisfy contrast where needed.

2.2 Typography tokens

Recommended fonts (web safe fallback)

Display / UI: Inter variable or Inter. Inter is modern, compact, excellent for dashboards.

Accent headings: GT Haptik or Satoshi if you have licence. If not, use Inter for both.

Tokens

--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
--font-mono: "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;

--text-xs:     0.75rem  /* 12px */
--text-sm:     0.875rem /* 14px */
--text-base:   1rem     /* 16px */
--text-lg:     1.125rem /* 18px */
--text-xl:     1.25rem  /* 20px */
--text-2xl:    1.5rem   /* 24px */
--text-3xl:    1.875rem /* 30px */
--text-4xl:    2.25rem  /* 36px */


Line heights

--leading-tight: 1.1
--leading-snug:  1.25
--leading-normal:1.5

2.3 Spacing and layout tokens (modular scale)

Use a scale based on 4 px unit.

--space-0:   0px
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px

2.4 Radii, elevation, borders
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-pill: 9999px

--border thin: 1px solid var(--color-muted-300)
--box-shadow-sm: 0 1px 2px rgba(10, 10, 10, 0.04)
--box-shadow-md: 0 6px 20px rgba(3, 6, 23, 0.08)
--box-shadow-lg: 0 20px 60px rgba(3, 6, 23, 0.12)

2.5 Breakpoints (mobile first)
--bp-sm: 640px   /* phones large */
--bp-md: 768px   /* tablets */
--bp-lg: 1024px  /* small desktop */
--bp-xl: 1280px  /* large desktop */
--bp-2xl: 1536px

3. Layout and grid

Responsive grid patterns

Mobile: single column, content stacked.

Tablet: 2 columns for content, KPI tiles grid 2 columns.

Desktop: 12-column grid with 24 px gutter for main workspace.

Rules

Container max width at each breakpoint:

md: 720 px

lg: 1024 px

xl: 1280 px

Column gap: use --space-6. Row gap: --space-4.

Sidebar width: 260 px on desktop, collapsible to icon bar on smaller widths.

Top nav height: 64 px on desktop, 56 px on mobile.

Example 12 column behaviour

Use column spans for cards: KPI card span 3 on desktop, 6 on tablet, 12 on mobile.

4. Component library and styles

Use accessible primitives and headless UI components. Suggestions: Radix UI or Headless UI for primitives, shadcn UI for patterns, and Tailwind CSS for styling.

Components below include states, ARIA and keyboard guidance.

4.1 Buttons

Variants: primary, secondary, ghost, danger, icon button.

Primary

Background: --color-primary-500

Text: white

Radius: --radius-md

Padding: 12 px vertical, 20 px horizontal

Shadow: --box-shadow-sm

States: hover lighten 6, active deepen 8, disabled: mute background to --color-muted-300 and remove pointer

Accessibility

Focus ring: 3 px solid outline using box-shadow: 0 0 0 3px rgba(10,170,223,0.16)

Use aria-pressed for toggle buttons.

4.2 Input fields and selects

Structure

Height: 44 px

Padding: 12 px

Border: 1 px solid --color-muted-300

Radius: --radius-sm

Placeholder: --color-muted-400

Error state: border color --color-danger, small error text below in 12 px

Keyboard

Enter triggers form submit, Escape closes dropdowns.

4.3 Cards and KPI tiles

KPI tile

Use minimal card with label, prominent numeric value, small sparkline below.

Background: surface, border: none or 1 px soft line.

Use subtle upward green chip or downward red chip for PnL.

Card accessibility

Each card should be focusable if interactive using tabindex="0" and aria-label describing content.

4.4 Tables and trade history

Trade table must be dense and readable.

Column rules

Fixed column widths for timestamp and symbol, flexible for notes.

Use zebra rows only if it improves readability else use row separators.

Row interactions

Row is focusable. Keyboard: Arrow keys to move, Enter to open detail modal.

Provide inline actions icons: annotate, export row, mark reviewed.

Sorting and filtering

Column headers are clickable sortable controls with aria-sort attribute.

Filters are grouped above the table; each filter control is accessible with label and description.

Performance

Virtualise long lists (react-window) to keep UI snappy for 10k rows.

4.5 Charts and visualisations

Chart principles

Use high contrast lines for main series. Use muted colours for context overlays.

Keep charts uncluttered. Use tooltips and crosshair interaction.

Provide accessible summaries below charts for screen readers.

Chart palette

Equity curve: --color-primary-500

Drawdown area: translucent --color-danger with 0.18 alpha

Profit bars: --color-profit

Loss bars: --color-loss

Heatmaps: sequential from --color-heat-1 to --color-heat-4

Interactions

Hover shows exact values and time. Click locks tooltip.

Keyboard accessible: focusable chart container with arrow keys moving crosshair.

Libraries

Use Recharts or visx for React. For high performance, prefer canvas based libs like Chart.js with its streaming plugin or trading-specific libraries that support interaction.

4.6 Modals, drawers and overlays

Modal

Centre modal, overlay uses --color-overlay. Modal width responsive: 92% mobile, 720 px desktop.

Close with ESC and by clicking outside if unsaved changes are absent. If unsaved changes present show confirm.

Drawer

Right side drawer for trade detail on desktop. Use frictionless animation.

4.7 Notifications and toasts

Notifications short, concise. Use stacked toasts in top right. Use success, error, info colours and icons. Accessible via role="status" for success and role="alert" for errors.

5. Microinteraction and motion

Principles

Use motion sparingly to enhance understanding, not decoration.

Respect reduce motion user preference.

Motion tokens

--motion-fast: 120ms
--motion-medium: 220ms
--motion-slow: 360ms
--motion-ease: cubic-bezier(0.2, 0.9, 0.2, 1)


Use cases

Button hover: scale 1.02, ease motion-fast.

Modal open: fade + translateY 10 px over motion-medium.

Chart transitions: tween line updates over motion-medium.

Sidebar collapse: width tween with motion-slow.

Accessibility

Honour prefers-reduced-motion media query and provide instant state changes if set.

6. Accessibility guidelines

WCAG target: minimum AA for all text and interactive contrast.

Focus order: logical document order. Visible focus ring on all interactive elements.

Keyboard support: all interactive controls must be operable using keyboard alone. Provide aria-* attributes for screen readers.

Semantic HTML: use <table> for tabular trade history, <button> for actions, <dialog> for modals where supported.

Screen reader summaries: each chart must include a short aria-label and a detailed table data alternative hidden from visual display using sr-only class.

Colour contrast checks

Body text ratio at least 4.5:1.

Small text and interactive elements ideally 7:1 where possible.

7. Data visualisation rules and examples

Guidelines

Always label axes and units. Use timezones explicitly for time axis.

Avoid using colour alone to convey meaning. Use icons or shapes for additional clarity.

Provide export options for charts and data.

Example chart patterns

Equity curve: line with area fill 8% opacity, highlight max drawdown region in red.

Win rate histogram: grouped bar chart with neutral palette and overlay of moving average.

Time-of-day heatmap: 24 columns for hours and rows for days or sessions. Use sequential heat scale.

Colourblind accessibility

Use palette that remains readable for deuteranopia: avoid pure red/green pairs without contrast. Use patterns or hover text to disambiguate.

8. Dark theme

Tokens for dark theme

Swap surface to #071021

Text primary: #E6EEF6

Muted: #93A2B8

Card surfaces slightly elevated: use rgba(255,255,255,0.02) overlay plus box-shadow adjusted.

Design rules

Preserve saturation of semantic colours. Tune alpha of fills so charts remain readable.

Icons and small UI elements should increase contrast by 10 to 15% in dark theme.

Switching

Theme preference saved per user and defaulted to system preference.

9. Iconography and imagery

Icons

Use a consistent icon set: Lucide or Heroicons. Use line icons for neutral UI and filled icons for stateful actions.

Sizes: 16 px for inline, 20 px for button icons, 24 px for major actions.

Imagery

Avoid stock imagery in core analytics screens. Use custom abstract illustrations only in onboarding or empty states. Keep illustrations monochrome accent colour to maintain focus.

10. Copy and content patterns

Headings

H1: short phrase, no punctuation. Example: "Portfolio overview"

KPI labels: short descriptive phrase then numeric value.

Microcopy examples

Empty table: "No trades found for selected range. Try a different timeframe or connect a wallet."

AI assistant prompt placeholder: "Ask about your performance or a trade. For example: Why did I lose on 2026-01-12?"

Tone

Friendly, concise and professional. Avoid jargon where possible.

11. Component checklist for implementation

High priority for hackathon MVP

Wallet connect header

KPI tiles with sparklines

Equity curve with drawdown area

Trade table with pagination and virtualisation

Trade detail modal with annotation and tagging

Filters bar (symbol, date range, order type)

CSV export button and chart PNG export

Basic AI assistant modal

Simulator modal with form controls

Polish and stretch

Achievements and gamification UI

Community benchmark view

Mobile push-like notifications via web push or Telegram links

12. Tailwind mapping and example CSS variables

Provide a ready mapping snippet you can paste into :root and a sample Tailwind config mapping idea.

Example CSS variables to include at top of your stylesheet:

:root{
  --color-primary-500: #0aaadf;
  --color-bg: #ffffff;
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  --text-base: 1rem;
  --space-4: 16px;
  --radius-md: 8px;
  --box-shadow-md: 0 6px 20px rgba(3,6,23,0.08);
}


Tailwind theme extension (concept)

// tailwind.config.js (partial)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { 500: '#0aaadf', 700: '#05607f' },
        profit: '#16a34a',
        loss: '#ef4444',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      spacing: { 18: '4.5rem' },
      borderRadius: { lg: '12px' },
      boxShadow: { md: '0 6px 20px rgba(3,6,23,0.08)' }
    }
  }
}

13. QA checklist for visual and UX review

Before submission validate:

All screens responsive at the breakpoints listed.

Keyboard navigation works for key flows: connect, open trade detail, annotate, AI query, simulate.

Colour contrast passes WCAG AA.

Charts have textual alternatives for screen readers.

All microinteractions respect reduce motion preference.

Exports produce legible CSV and high resolution PNG.

14. Brand assets and deliverables to create next

Primary logo and icon set in SVG

Figma file with tokens, components and 6 key screens

Design tokens JSON for engineers

Tailwind config file and sample components in a small component kit

Final note

This design system is ready to implement. It balances aesthetic quality, accessibility and production pragmatism. If you want I will:

produce a Figma-ready token JSON and component file,

scaffold React components for the most important UI pieces following these tokens,

or output the exact Tailwind config and a tiny component library for the KPI card, equity chart and trade table.

