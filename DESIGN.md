---
name: Digital Dropbox Design System
colors:
  surface: "#0b1326"
  surface-dim: "#0b1326"
  surface-bright: "#31394d"
  surface-container-lowest: "#060e20"
  surface-container-low: "#131b2e"
  surface-container: "#171f33"
  surface-container-high: "#222a3d"
  surface-container-highest: "#2d3449"
  on-surface: "#dae2fd"
  on-surface-variant: "#bbcabf"
  inverse-surface: "#dae2fd"
  inverse-on-surface: "#283044"
  outline: "#86948a"
  outline-variant: "#3c4a42"
  surface-tint: "#4edea3"
  primary: "#4edea3"
  on-primary: "#003824"
  primary-container: "#10b981"
  on-primary-container: "#00422b"
  inverse-primary: "#006c49"
  secondary: "#c0c1ff"
  on-secondary: "#1000a9"
  secondary-container: "#3131c0"
  on-secondary-container: "#b0b2ff"
  tertiary: "#ffb3af"
  on-tertiary: "#650911"
  tertiary-container: "#fc7c78"
  on-tertiary-container: "#711419"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#6ffbbe"
  primary-fixed-dim: "#4edea3"
  on-primary-fixed: "#002113"
  on-primary-fixed-variant: "#005236"
  secondary-fixed: "#e1e0ff"
  secondary-fixed-dim: "#c0c1ff"
  on-secondary-fixed: "#07006c"
  on-secondary-fixed-variant: "#2f2ebe"
  tertiary-fixed: "#ffdad7"
  tertiary-fixed-dim: "#ffb3af"
  on-tertiary-fixed: "#410005"
  on-tertiary-fixed-variant: "#842225"
  background: "#0b1326"
  on-background: "#dae2fd"
  surface-variant: "#2d3449"
  slate-950: "#020617"
  slate-900: "#0f172a"
  slate-800: "#1e293b"
  slate-700: "#334155"
  slate-500: "#64748b"
  slate-200: "#e2e8f0"
  slate-50: "#f8fafc"
  emerald-600: "#059669"
  emerald-500: "#10b981"
  emerald-50: "#ecfdf5"
  indigo-500: "#6366f1"
typography:
  headline-xl:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
  headline-xl-mobile:
    fontFamily: Outfit
    fontSize: 30px
    fontWeight: "700"
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1024px
  sidebar-width: 250px
  gutter: 1.5rem
  section-padding: 2rem
---

## Brand & Style

The design system is engineered for high trust, professional efficiency, and administrative clarity. It bridges the gap between two distinct user experiences: a high-velocity, data-dense Manager Dashboard and a high-converting, reassuring Public Portal.

The style is a synthesis of **Corporate Modern** and **Minimalism**. It prioritizes information density for managers while utilizing intentional whitespace and soft elevations for public users to drive conversion.

- **Manager Dashboard:** Adopts a dark, "Command Center" aesthetic. It utilizes deep slate surfaces and vibrant accents to reduce eye strain during prolonged administrative tasks and highlight key success metrics.
- **Public Portal:** Employs a clean, high-trust light theme. It focuses on clarity, utilizing emerald accents to signify financial security and progress, coupled with soft shadows to create a welcoming, approachable atmosphere.

## Colors

The palette is anchored by functional color roles that shift based on the interface context.

### Theme-Specific Applications

- **Manager (Dark Mode):**
  - Background: `slate-950`
  - Surfaces/Cards: `slate-900`
  - Borders: `slate-800`
  - Primary Action: `indigo-500` (Navigation & Secondary Actions)
  - Success/Status: `emerald-500`
- **Public (Light Mode):**
  - Background: `slate-50`
  - Surfaces/Cards: `#FFFFFF` (White)
  - Borders: `slate-200`
  - Primary Action: `emerald-600` (Trust-based conversion)
  - Muted Text: `slate-500`

### Color Logic

Primary actions in the public portal use Emerald to invoke financial growth and security. In the dashboard, Indigo is the primary navigational guide, while Emerald is reserved for success states and document finalization.

## Typography

This design system uses a dual-font strategy to balance character and utility.

**Outfit** is used for headings and brand moments to provide a modern, premium geometric feel that distinguishes the product from generic SaaS tools. **Inter** is utilized for all UI elements, data tables, and body copy to ensure maximum legibility and a systematic feel.

For body text in light mode, use `slate-600` for balanced contrast. In dark mode, use `slate-400` to maintain readability without harsh glare. All headlines should utilize tight tracking (`-0.01em` to `-0.02em`) to maintain a polished, editorial appearance.

## Layout & Spacing

The system employs two distinct layout models:

### 1. Dashboard Layout (Fixed + Fluid)

- **Structure:** A fixed 250px left sidebar for navigation with a fluid main content area.
- **Grid:** A 12-column grid within the main content area for complex data layouts.
- **Constraints:** Main content is capped at `1024px` (max-w-5xl) to maintain line-length readability.

### 2. Public Portal Layout (Centered)

- **Structure:** A single-column, centered layout designed for high conversion.
- **Width:** The primary conversion card is constrained to 480px - 600px on desktop to focus user attention.
- **Responsive:** On mobile, margins reduce to 1rem, and all cards/buttons transition to full-width.

### Spacing Rhythm

Spacing follows a 4px (0.25rem) base unit. Use `1.5rem` (24px) for standard gutters and `2rem` (32px) for page-level padding.

## Elevation & Depth

Visual hierarchy is achieved through theme-specific depth strategies:

### Manager Dashboard

- **Strategy:** Tonal Layers. No shadows are used. Depth is conveyed through background color steps: `slate-950` (base) -> `slate-900` (surface) -> `slate-800` (borders/interactive).
- **Interactive:** Hover states are indicated by shifting background tones rather than increasing elevation.

### Public Portal

- **Strategy:** Ambient Shadows. Uses a clean, multi-layered shadow approach on the primary conversion card to make it feel tangible and "above" the soft `slate-50` background.
- **Shadow Character:** Soft, diffused shadows with a low-opacity slate tint (`0 4px 6px -1px rgb(0 0 0 / 0.1)`).
- **Borders:** Crisp `slate-100` borders provide a refined finish to cards even when shadowed.

## Shapes

The design system uses a "Rounded" (0.5rem base) shape language to balance professional precision with modern approachability.

- **Standard Elements:** Input fields, buttons, and badges use 0.5rem (`rounded`).
- **Containers:** Dashboard cards and Public Portal conversion cards use 1rem (`rounded-xl`) to create a softer, more premium container feel.
- **Refinement:** Interactive elements should have a subtle 1px border. In the dashboard, use `slate-800`. In the portal, use `slate-200`.

## Components

### Buttons

- **Public Primary:** `bg-emerald-600` with white text. High-contrast, large padding. Transitions: `hover:shadow-lg hover:-translate-y-0.5`.
- **Dashboard Primary:** `bg-indigo-500` or `emerald-500`.
- **Dashboard Secondary:** `bg-transparent` with `border-slate-800`.

### Cards

- **Public:** White background, `shadow-sm`, `border-slate-100`. Focus on the central document list.
- **Dashboard:** `bg-slate-900`, `border-slate-800`. Used for data groupings and metrics.

### Form Inputs

- **Base:** 1px solid border (`slate-200` light / `slate-700` dark).
- **Focus:** `ring-2 ring-emerald-500` regardless of theme to maintain a consistent "security" focus ring.
- **Labels:** `text-sm font-medium` in `slate-900` (light) or `slate-200` (dark).

### Data Lists & Files

- Use Lucide icons with a `1.5px` stroke.
- Document items should feature a leading `FileText` icon and a trailing `Lock` or `CheckCircle2` icon.
- Hovering over list items should trigger a subtle background tint (`hover:bg-slate-50` in light / `hover:bg-slate-800` in dark).

### Empty States

Center-aligned with a muted `slate-400` icon. Ensure a clear Primary CTA button is positioned directly below the helper text.
