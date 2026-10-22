---
name: Linkwise Threat Intelligence
colors:
  surface: '#0d1322'
  surface-dim: '#0d1322'
  surface-bright: '#33394a'
  surface-container-lowest: '#080e1d'
  surface-container-low: '#151b2b'
  surface-container: '#191f2f'
  surface-container-high: '#242a3a'
  surface-container-highest: '#2f3445'
  on-surface: '#dde2f8'
  on-surface-variant: '#bacac7'
  inverse-surface: '#dde2f8'
  inverse-on-surface: '#2a3040'
  outline: '#859491'
  outline-variant: '#3b4a47'
  surface-tint: '#35ddce'
  primary: '#51f0e1'
  on-primary: '#003733'
  primary-container: '#22d3c5'
  on-primary-container: '#005650'
  inverse-primary: '#006a63'
  secondary: '#a4c9ff'
  on-secondary: '#00315d'
  secondary-container: '#0267b8'
  on-secondary-container: '#d6e5ff'
  tertiary: '#64f2b5'
  on-tertiary: '#003824'
  tertiary-container: '#42d59a'
  on-tertiary-container: '#00583b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#5ef9ea'
  primary-fixed-dim: '#35ddce'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0d1322'
  on-background: '#dde2f8'
  surface-variant: '#2f3445'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.02em
  metric-display:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

The brand personality is clinical, vigilant, and authoritative. Designed for cybersecurity engineers, SOC analysts, and threat intelligence operators, the interface minimizes cognitive fatigue during high-stress incident responses while maintaining instantaneous visual triage.

The aesthetic follows an ultra-precise, technical minimalism. It eschews decorative gradients, skeuomorphic depth, and gratuitous motion in favor of structural clarity, dense tabular rhythm, crisp 1px delineation lines, and purpose-driven telemetry indicators. Every pixel functions to accelerate mean time to detect (MTTD) and mean time to remediate (MTTR).

## Colors

The palette establishes an ergonomic, deep-space dark environment that prioritizes optical endurance and strict signal-to-noise ratios.

- **Canvas & Surfaces:**
  - Base Background: `#0B1120` (Root viewport)
  - Card & Container Surface: `#111827` (Elevation level 1)
  - Elevated Popover / Flyout Surface: `#1E293B` (Elevation level 2)
  - Subtle Structural Borders: `#263247` (Defines structural compartments without visual clutter)

- **Accents:**
  - Primary Accent: `#22D3C5` (Cool cyan/teal for key actions, active navigation tabs, focal ML confidence anchors)
  - Secondary Accent: `#60A5FA` (Muted technical blue for secondary interactions, passive telemetry graphs, helper links)

- **Typography & Icons:**
  - Primary Content: `#F1F5F9` (Headlines, primary metrics, active values)
  - Muted / Secondary Content: `#94A3B8` (Labels, metadata, timestamps, non-critical telemetry)

- **Detection Status System:**
  - Safe / Verified: `#10B981` (Emerald)
  - Suspicious / Anomaly: `#F59E0B` (Amber)
  - Malicious / Phishing Confirmed: `#EF4444` (Rose/Red)
  - Muted Status Backgrounds: 10% opacity tints of the respective status color against `#111827`.

## Typography

Typography balances rapid scanning with dense technical readout capabilities. 

- **Inter** governs all UI chrome, body text, dialogs, and structural navigation. Its uniform vertical alignment ensures legible data tables and multi-column metadata panels.
- **JetBrains Mono** is reserved exclusively for tabular data, domain validation inputs, SHA-256 hashes, IP addresses, Bayesian classification scores, and machine-readable payload snippets.
- Numbers within tables and metrics must always use tabular figures (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during live telemetry updates.

## Layout & Spacing

The layout model is a rigorous, fluid-density 12-column grid system tuned for high information throughput.

- **Breakpoints & Grids:**
  - **Desktop (≥1280px):** 12-column fluid grid, `2rem` outer margin, `1.5rem` gutter. Supports persistent collapsible telemetry sidebars (320px fixed) with dynamic inspection panels.
  - **Tablet (768px – 1279px):** 8-column grid, `1.5rem` outer margin, `1rem` gutter. Collapses auxiliary panels into tabbed or drawer views.
  - **Mobile (<768px):** 4-column grid, `1rem` outer margin, `0.75rem` gutter. Stacks metrics and data logs vertically into single-column card feeds.

- **Density Rules:**
  - Component layouts adhere to strict 4px/8px incremental rhythm.
  - Vertical table padding defaults to compact sizing (`space-sm` / 8px) to maximize visible event rows above the fold.

## Elevation & Depth

This design system rejects heavy drop shadows, neon glows, and faux-3D layering in favor of **structural containment through low-contrast outlines and planar tonal layering**.

- **Level 0 (Base Canvas):** `#0B1120`. No borders.
- **Level 1 (Cards, Tables, Structural Modules):** `#111827`, wrapped in a crisp `1px solid #263247` border.
- **Level 2 (Flyouts, Dropdowns, Hovered Rows, Modals):** `#1E293B`, bound by `1px solid #3B4D68`. Subtle technical drop shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.45)`.
- **Active / Focused State Depth:** Focused elements never expand outward with soft blurs; they receive an internal or tightly offset `1px` or `2px` ring in `#22D3C5` at 100% opacity.

## Shapes

The interface leverages controlled, disciplined soft rounding to avoid both harsh brutalist edges and overly consumer-oriented pill formats.

- Standard buttons, inputs, cards, and system panels use `rounded-lg` (0.5rem / 8px).
- Badges, status chips, and code tags use `rounded` (0.25rem / 4px) to retain an architectural, data-oriented character.
- Pure circular geometry is strictly restricted to user avatars and radial progress rings.

## Components

### Buttons
- **Primary Action:** Solid `#22D3C5` fill, `#0B1120` bold text. Radius: 8px (`rounded-lg`). Hover: `#1AB8AC`. Focus: 2px ring `#22D3C5` with 2px offset.
- **Secondary Action:** Transparent background with `1px solid #263247` outline, `#F1F5F9` text. Hover: `#1E293B` background and `#3B4D68` border.
- **Destructive Action:** Transparent with `1px solid #EF4444` border and `#EF4444` text. Hover: `#EF4444` background with `#F1F5F9` text.

### Inputs (Domain, IP & Search Bars)
- Background: `#0B1120`. Border: `1px solid #263247`. Text: `JetBrains Mono`, `#F1F5F9`.
- Placeholder: `#94A3B8`.
- Focus state: Border transitions to `#22D3C5` with no diffuse outer glow.
- Inline prefix/suffix adornments (e.g., protocol tags `https://`, extraction status) set in `#94A3B8` mono caps.

### Status Indicators & Chips
- Monospace compact labels (`label-code-sm`) set inside a 4px rounded container.
- **Safe:** Text `#10B981`, Background `rgba(16, 185, 129, 0.1)`, Border `1px solid rgba(16, 185, 129, 0.2)`.
- **Suspicious:** Text `#F59E0B`, Background `rgba(245, 158, 11, 0.1)`, Border `1px solid rgba(245, 158, 11, 0.2)`.
- **Malicious:** Text `#EF4444`, Background `rgba(239, 68, 68, 0.1)`, Border `1px solid rgba(239, 68, 68, 0.2)`.

### Cards & Analytical Panels
- Background: `#111827`. Border: `1px solid #263247`. Radius: `rounded-lg` (8px).
- Internal structural divisions (header to body) use `1px solid #263247`. No inner shadows.

### Tables & Log Streamers
- Headers: `#94A3B8`, `12px Inter medium`, uppercase with `0.05em` tracking. Bottom border `1px solid #263247`.
- Rows: Default `#111827`. Hover row: `#1E293B`. Alternating striping is avoided; differentiation is achieved solely through subtle 1px dividers (`#1F293D`).
- Cells containing metrics, entropy scores, or domains must render in `JetBrains Mono`.

### Confidence Score Rings / Gauges
- Clean vector SVGs featuring a 4px track width. 
- Background track: `#263247`. Fill path: Scaled between `#10B981`, `#F59E0B`, or `#EF4444` with centered `JetBrains Mono` score readouts.