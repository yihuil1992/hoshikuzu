---
name: Hoshikuzu
description: A quiet archival star atlas for small tools, work, and drifting experiments.
colors:
  deep-space: "#02040a"
  ink-night: "#05070d"
  observatory-panel: "#101827"
  starlight: "#f8fafc"
  starlight-muted: "#aeb8c7"
  starlight-faint: "#6f7b8d"
  hairline: "#ffffff24"
  hairline-faint: "#ffffff14"
  pale-cyan: "#aad7dc"
  soft-amber: "#f5f0dc"
  daylight-bg: "#ffffff"
  daylight-text: "#172033"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "0"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.18em"
rounded:
  xs: "2px"
  sm: "6px"
  md: "8px"
  lg: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  atlas-button:
    backgroundColor: "{colors.starlight}"
    textColor: "{colors.deep-space}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "7px 12px"
  atlas-panel:
    backgroundColor: "{colors.ink-night}"
    textColor: "{colors.starlight}"
    rounded: "{rounded.xs}"
    padding: "12px 16px"
  atlas-link:
    backgroundColor: "transparent"
    textColor: "{colors.starlight-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.xs}"
    padding: "4px 0"
---

# Design System: Hoshikuzu

## 1. Overview

**Creative North Star: "The Quiet Archival Star Atlas"**

Hoshikuzu should feel like a private astronomical index: precise, dimly lit, and intentional. The interface is not a spacecraft dashboard and not a marketing page. It is a working atlas where each 2D element annotates the sky and each tool feels like an instrument filed into the same collection.

The design language is restrained but not blank. Its craft comes from alignment, small labels, hairline rules, measured spacing, and state changes that feel calibrated. Surfaces should be sparse, sharp enough to feel designed, and soft enough to avoid feeling technical for its own sake.

**Key Characteristics:**

- Deep-space canvas with warm off-white text.
- Small uppercase metadata labels with generous tracking.
- Thin rules, tick marks, and pointer lines used as annotation, not decoration.
- Low-opacity panels that preserve the starfield as the primary atmosphere.
- Single-stage motion with ease-out timing and no dramatic choreography.

## 2. Colors

The palette is a restrained dark atlas palette: blue-black neutrals, warm starlight text, and rare cyan or amber accents borrowed from the stars.

### Primary

- **Deep Space** (`deep-space`): The canonical background for the starfield and dark UI surfaces. Use it wherever the interface needs to disappear behind the content.
- **Starlight** (`starlight`): Primary text and high-emphasis action fill. It should feel warm and luminous, never pure white glare.

### Secondary

- **Pale Cyan Signal** (`pale-cyan`): Used sparingly for glows, focus echoes, and selected signal details. It should appear in less than ten percent of a screen.
- **Soft Amber Lamp** (`soft-amber`): A secondary light color for point lights or rare warmth. Use only when the interface needs a human temperature.

### Neutral

- **Ink Night** (`ink-night`): Panel fill for star detail cards and overlays.
- **Observatory Panel** (`observatory-panel`): Dark container color for 2D tool surfaces when black would feel too empty.
- **Muted Starlight** (`starlight-muted`): Body copy, helper text, secondary labels.
- **Faint Starlight** (`starlight-faint`): Low-priority metadata and footer links.
- **Hairline** (`hairline`) and **Faint Hairline** (`hairline-faint`): Borders, dividers, and annotation lines.
- **Daylight Background** (`daylight-bg`) and **Daylight Text** (`daylight-text`): Existing utility pages may use light mode, but future unification should bring them closer to the atlas system.

### Named Rules

**The Stars Own The Light Rule.** Page-wide gradients, decorative halos, and fixed nebula images are prohibited. Light should come from stars, focus states, and functional annotations.

**The Ten Percent Accent Rule.** Cyan and amber accents are rare signals. If an accent is visible before the content is understood, it is too loud.

## 3. Typography

**Display Font:** system sans with platform fallbacks.
**Body Font:** system sans with platform fallbacks.
**Label/Mono Font:** system sans, uppercase labels with wide tracking.

**Character:** The type should feel like an index system: spare, legible, and slightly formal. Use weight, case, and tracking to create hierarchy before adding decorative treatments.

### Hierarchy

- **Display** (300, `clamp(2.25rem, 5vw, 3.75rem)`, line-height `1`): Home title and major atmospheric headings only.
- **Headline** (400 to 600, `2rem` to `3rem`, line-height `1.1`): Section headings on tool and work pages.
- **Title** (600, `0.875rem` to `1rem`, line-height `1.2`, uppercase when attached to objects): Star names, panel headings, compact section titles.
- **Body** (400, `0.875rem` to `0.9375rem`, line-height `1.6`): Descriptions and tool instructions. Keep line length under 72ch.
- **Label** (600, `0.625rem` to `0.75rem`, letter-spacing `0.14em` to `0.24em`, uppercase): Metadata, footer links, tags, object states, and small controls.

### Named Rules

**The Index Voice Rule.** Labels may be uppercase and tracked; body copy must remain calm and readable. Do not turn every word into a label.

**The No Hero Inside Panels Rule.** Panel text stays compact. Display-scale type belongs to the page atmosphere, not cards, dialogs, or tool controls.

## 4. Elevation

Hoshikuzu uses tonal layering and dim atmospheric shadows. Surfaces are nearly flat at rest; depth appears through border contrast, subtle darkness, and occasional diffuse glow around active objects.

### Shadow Vocabulary

- **Panel Night Shadow** (`0 22px 70px rgba(0,0,0,0.54), 0 0 34px rgba(170,215,220,0.12)`): Star detail panels and rare floating overlays.
- **Control Shadow** (`0 8px 24px rgba(0,0,0,0.18)`): Small floating controls that must separate from mixed backgrounds.
- **Text Grounding Shadow** (`0 2px 18px rgba(0,0,0,0.82)`): Home display text over moving stars.

### Named Rules

**The Flat Until Focused Rule.** Surfaces should not float by default. Use elevation only when the user has selected, hovered, opened, or focused something.

**The No Glass Default Rule.** Backdrop blur is allowed only when it improves readability over the starfield. It is not a decorative material.

## 5. Components

### Buttons

- **Shape:** Tight rectangle with minimal rounding (`2px` to `6px`) for atlas controls; default shadcn buttons may use `8px` to `10px` until unified.
- **Primary:** Warm starlight fill on deep-space text for decisive actions such as opening a mapped object.
- **Hover / Focus:** Increase border or text clarity. Use a visible focus ring, but keep it soft and localized.
- **Secondary / Ghost:** Transparent or near-transparent with hairline border. Prefer icon buttons for close, navigation, and compact tools.

### Chips

- **Style:** Metadata chips use faint borders, muted text, and low-contrast fills. They should read as tags in a catalog, not pills in a SaaS filter bar.
- **State:** Selected chips may brighten text and border, but should not introduce saturated fills.

### Cards / Containers

- **Corner Style:** Small, precise corners (`2px` to `8px`) for starfield panels. Utility pages may retain `10px` during migration, but avoid large rounded cards.
- **Background:** Deep blue-black or low-opacity ink surfaces on dark pages; restrained light surfaces only on tool pages that require dense reading.
- **Shadow Strategy:** Use Panel Night Shadow only for active overlays. Static cards rely on borders and spacing.
- **Border:** One-pixel hairline borders with white alpha on dark surfaces or neutral borders on light surfaces.
- **Internal Padding:** Compact panels use `12px 16px`; fuller tool cards use `24px`.

### Inputs / Fields

- **Style:** Transparent or low-opacity fills with one-pixel borders. Inputs should feel like instrument controls, not large form blocks.
- **Focus:** Border brightens and ring appears. Do not use saturated glow.
- **Error / Disabled:** Error states may use destructive color, but keep surrounding UI calm. Disabled states reduce opacity without changing layout.

### Navigation

- **Style:** Minimal text links, small labels, and icon affordances. Footer and secondary nav should sit quietly at edges of the viewport.
- **Active / Hover:** Text brightens and hairlines become clearer. Avoid background slabs unless the nav is inside a tool panel.
- **Mobile:** Keep tap targets practical while preserving the low-density atmosphere.

### Star Detail Panel

The signature component is the mapped-object panel attached to a selected star. It uses a dark translucent panel, hairline connector, uppercase metadata, compact description, and a small starlight action button. It should set the tone for future 2D overlays.

## 6. Do's and Don'ts

### Do:

- **Do** make 2D UI feel like annotations, labels, and instruments attached to a star atlas.
- **Do** keep accents rare and meaningful, especially `pale-cyan` and `soft-amber`.
- **Do** use thin hairlines, compact metadata, and carefully aligned panels to add design presence.
- **Do** keep motion single-stage, short, and physically plausible.
- **Do** preserve readability over the starfield with local darkening, text shadows, or restrained panel fills.

### Don't:

- **Don't** make it feel like a generic SaaS landing page with oversized hero metrics, repeated feature cards, and conversion copy.
- **Don't** make it feel like a neon sci-fi HUD, cyberpunk control panel, or game menu.
- **Don't** use heavy glassmorphism, bokeh blobs, purple-blue gradient wash, or decorative glow as the default answer.
- **Don't** use real nebula imagery as a fixed screen background. It reads as a foreground sticker when the 3D scene rotates.
- **Don't** let 2D UI compete with the starfield. The interface should annotate the sky, not cover it.
