---
name: Luminous Commerce
colors:
  surface: '#f8f9ff'
  surface-dim: '#cadbf8'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff3ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d4e3ff'
  on-surface: '#0b1c31'
  on-surface-variant: '#474556'
  inverse-surface: '#213147'
  inverse-on-surface: '#ebf1ff'
  outline: '#777588'
  outline-variant: '#c8c4da'
  surface-tint: '#5036fa'
  primary: '#3904e7'
  on-primary: '#ffffff'
  primary-container: '#533afd'
  on-primary-container: '#ddd9ff'
  inverse-primary: '#c5c0ff'
  secondary: '#4d6079'
  on-secondary: '#ffffff'
  secondary-container: '#cee1ff'
  on-secondary-container: '#51647d'
  tertiary: '#960038'
  on-tertiary: '#ffffff'
  tertiary-container: '#c2004b'
  on-tertiary-container: '#ffd2d7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c5c0ff'
  on-primary-fixed: '#130067'
  on-primary-fixed-variant: '#3600e1'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#b5c8e5'
  on-secondary-fixed: '#071c32'
  on-secondary-fixed-variant: '#364860'
  tertiary-fixed: '#ffd9dd'
  tertiary-fixed-dim: '#ffb2bd'
  on-tertiary-fixed: '#400013'
  on-tertiary-fixed-variant: '#900036'
  background: '#ffffff'
  on-background: '#0b1c31'
  surface-variant: '#d4e3ff'
  border: '#e5edf5'
  success: '#15be53'
  success-text: '#108c3d'
  warning: '#9b6829'
  brand-dark: '#1c1e54'
  magenta: '#f96bee'
  magenta-light: '#ffd7ef'
  label: '#273951'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '300'
    lineHeight: 52px
    letterSpacing: -0.96px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '300'
    lineHeight: 36px
    letterSpacing: -0.64px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '300'
    lineHeight: 32px
    letterSpacing: -0.26px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '300'
    lineHeight: 28px
    letterSpacing: -0.22px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '300'
    lineHeight: 26px
    letterSpacing: 0px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '300'
    lineHeight: 22px
    letterSpacing: 0px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0px
  tabular-nums:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: -0.36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  micro: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system is built on the philosophy of **"Lightweight Authority."** It targets a sophisticated mobile audience that values technical precision and understated luxury. The aesthetic moves away from the aggressive boldness of typical e-commerce, opting instead for a "Corporate Modern" approach infused with high-precision typographic details.

The visual language is defined by:
- **Aerodynamic Clarity:** Utilizing ultra-light font weights (300) even for massive headlines to convey a sense of calm, established power.
- **Chromatic Depth:** Avoiding neutral grays and pure blacks. Every surface, border, and shadow is infused with a navy or blue tint to maintain a "branded" atmosphere.
- **Structural Rigor:** A strict 8px grid system ensures a predictable, rhythmic layout that feels engineered rather than merely decorated.
- **Subtle Elevation:** Multi-layered, blue-tinted shadows create a sense of floating layers, suggesting a high-performance, responsive interface.

## Colors

The palette is anchored by **Stripe Purple**, used exclusively for primary actions and interactive states. **Deep Navy** serves as the structural anchor for all headings and high-contrast text, while **Body Blue** (#64748d) provides a softened secondary layer for descriptions and captions.

### Usage Guidelines:
- **Primary Purple:** Reserved for high-intent CTAs, active selection states, and focus indicators.
- **Deep Navy:** Used for all level 1-3 headings to maintain a premium, authoritative voice.
- **Success & Warning:** Use these functionally with their associated light-tint backgrounds for badges and alerts.
- **Border Blue:** Use `#e5edf5` for all structural dividers and card strokes to ensure the interface remains "airy" and light.
- **Backgrounds:** Stick to pure white for primary surfaces, utilizing `brand-dark` only for immersive, high-impact sections like footers or specialized featured modals.

## Typography

This system utilizes **Hanken Grotesk** as a close match to the technical, geometric nature of the requested aesthetic. The defining characteristic is the pervasive use of **Weight 300 (Light)** for nearly all text, including display sizes.

### Typographic Principles:
- **Authority through Lightness:** Avoid bold weights for headings. Use size and color (Deep Navy) to create hierarchy.
- **Data Precision:** For prices, stock counts, and financial figures, ensure the font-variant is set to `tabular-nums` to maintain vertical alignment in lists and tables.
- **Tight Tracking:** Larger headlines should use negative letter spacing (as defined in the tokens) to maintain a cohesive, "locked-in" feel.
- **Stylistic Sets:** Where supported, enable geometric stylistic sets to enhance the modern, architectural feel of the characters.

## Layout & Spacing

The layout is strictly mobile-first, utilizing an **8px base unit** to drive all spatial decisions.

### Layout Model:
- **Mobile Fluidity:** Content should span the full width of the screen minus the `margin-mobile` (20px) on each side.
- **Grid Context:** On larger mobile screens/tablets, use a 4-column grid. For phone screens, rely on a single-column stack with dynamic padding.
- **Section Rhythm:** Separate major logical sections with `xl` (40px) spacing. Use `md` (16px) for inner-card padding and `lg` (24px) for spacing between related components.
- **Safe Areas:** Adhere strictly to mobile safe areas, ensuring CTAs are never obscured by home indicators or notches.

## Elevation & Depth

We utilize **"Chromatic Depth,"** replacing standard gray shadows with multi-layered, blue-tinted shadows to create a sophisticated, three-dimensional effect.

### Shadow Tiers:
- **Ambient Lift (Cards):** Use a soft, subtle blue tint: `rgba(23, 23, 23, 0.08) 0px 15px 35px`.
- **Active Elevation (Popovers/Featured):** A dual-layer approach. Layer 1: `rgba(50, 50, 93, 0.25) 0px 30px 45px -30px`. Layer 2: `rgba(0, 0, 0, 0.1) 0px 18px 36px -18px`. 
- **Functional Layers:** Surfaces should not rely on shadows alone; use the `Border Default` (#e5edf5) to define edges even when elevation is present.

All elevated surfaces must use the `Pure White` (#ffffff) background to ensure high contrast against the subtle shadow tints.

## Shapes

The shape language is conservative and professional. It avoids the "playful" nature of pill shapes, opting for precise, structural radii.

- **Standard Radius (6px):** Apply to all cards, navigation bars, and mobile menus.
- **Component Radius (4px):** Apply to buttons, input fields, and small badges.
- **Featured Radius (8px):** Use only for high-impact hero elements or large product imagery containers.
- **Borders:** Always use a `1px` solid weight for borders unless creating a focus ring, which should be a `2px` solid stroke of the `Primary Purple`.

## Components

### Buttons
- **Primary:** Background `#533afd`, text `#ffffff`, 4px radius. Font weight 400.
- **Secondary:** Transparent background, `#e5edf5` border, `#533afd` text.
- **Ghost:** No border, `#2874ad` (Blue Info) text. Used for tertiary actions.

### Cards
- **Structure:** `Pure White` background, 6px radius, `Ambient Lift` shadow.
- **Stroke:** `1px solid #e5edf5`.
- **Padding:** Always `16px` (md) uniform internal padding.

### Input Fields
- **Default:** `1px solid #e5edf5` border, 4px radius, `Label` (#273951) for text.
- **Focus:** `1px solid #533afd` with a subtle blue outer glow.
- **Labels:** Use `label-md` in `Label` color, positioned strictly above the input.

### Chips & Badges
- **Status (Success):** Background `Success` at 20% opacity, border `Success` at 40% opacity, text `Success Text` (#108c3d).
- **Interactive Chips:** 4px radius, `#f7fafc` background, `#64748d` text. No pill shapes allowed.

### Navigation
- **Top Bar:** 6px bottom radius (mobile), `Deep Navy` for text and icons, `Pure White` background.
- **Bottom Tabs:** Fixed height 56px, active state indicated by `Primary Purple` icon and a 2px top-accent line.