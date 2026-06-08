# Handoff: Spravio Marketing Landing

## Overview

Marketing landing page for **Spravio**, a delivery-intelligence SaaS for development agencies. The page sells the product (turns Jira / Azure DevOps / GitHub into one live delivery dashboard for agency owners and project managers) and moves visitors to **Start free trial** or **Book a 15-min demo**. Target audience: agency CEOs, CTOs, and GPs (project managers).

The design is **editorial / warm-serif** — Fraunces display pairs with Inter body and JetBrains Mono eyebrows on a cream paper background with terracotta accent. Deliberately anti-generic-SaaS: no gradient hero, no stock UI-kit buttons, no blue.

## About the Design Files

The file bundled here (`Spravio Landing.html`) is a **design reference created in HTML** — a high-fidelity prototype showing the intended look, copy, interactions, and responsive behavior. **It is not production code to copy directly.**

Your task is to **recreate this design in the target codebase's existing environment** (Next.js, Nuxt, Astro, Remix, plain React, etc.) using its established patterns — routing, component library, styling solution (Tailwind / CSS-in-JS / vanilla CSS / etc.), image pipeline, i18n strategy, analytics hooks, and deployment target. If no web environment exists yet, pick the framework that best fits the team's stack; **Next.js (app router) + Tailwind** is a reasonable default for a static marketing site of this shape.

Lift **all design tokens, copy, SVGs, layout math, and interaction behavior** from the HTML verbatim. Translate structure to idiomatic components in the target framework.

## Fidelity

**High-fidelity.** The HTML contains final copy (EN + PT), pixel-correct spacing, the real color palette in oklch, production-ready SVG charts/logos, and the intended responsive behavior. Recreate pixel-perfectly using the codebase's existing libraries where they exist (fonts, buttons, layout primitives); only fall back to hand-rolled CSS for the editorial elements that don't exist in a standard design system (Fraunces display italic `<em>` accents, paper-grain background, animated hero dashboard).

## Page structure

The page is a single route. Order of sections (top → bottom):

1. **Sticky nav** (logo, links, lang toggle EN/PT, Sign in, Start free trial)
2. **Hero** — pill, big serif headline with italic emphasis, sub, CTAs, meta line, live dashboard mockup on right
3. **Features** (`#features`) — 9-card grid, icons, one card tagged "Exclusive to Spravio"
4. **How it works** (`#how`) — 3 numbered steps with code-style snippet
5. **Mobile app** (`#mobile`) — copy + 3 tilted phone mockups + App Store / Google Play badges
6. **Comparison** (`#compare`) — table vs. Jellyfish / Swarmia / LinearB (Spravio as highlighted column)
7. **Pricing** (`#pricing`) — Starter / Growth (featured) / Scale
8. **Testimonials** (`#love`) — 3 quotes, large mark glyph
9. **FAQ** (`#faq`) — 7 `<details>` accordions
10. **Final CTA** — centered, serif h2, two buttons
11. **Footer** — logo, tagline, 3 link columns, locale line

All `section` IDs above are anchors used by nav links — keep them stable.

## Design tokens (exact)

All defined as CSS custom properties on `:root` in the HTML. Port these to your token system (Tailwind `theme.extend`, CSS vars, Figma tokens — whatever the codebase uses).

### Color (light theme — primary)

| Token | oklch value | Purpose |
|---|---|---|
| `--cream` | `oklch(0.975 0.012 75)` | Page background |
| `--cream-2` | `oklch(0.955 0.018 72)` | Subtle section bg / inputs |
| `--cream-3` | `oklch(0.93 0.022 70)` | Deeper cream (avatars, rails) |
| `--paper` | `oklch(0.99 0.008 80)` | Cards / elevated surfaces |
| `--ink` | `oklch(0.22 0.02 40)` | Primary text, buttons |
| `--ink-2` | `oklch(0.36 0.02 40)` | Secondary text |
| `--ink-3` | `oklch(0.56 0.015 45)` | Tertiary / mono eyebrows |
| `--rule` | `oklch(0.88 0.015 60)` | Hairline borders |
| `--rule-2` | `oklch(0.82 0.02 55)` | Emphasized borders |
| `--accent` | `oklch(0.62 0.14 35)` | Terracotta — CTAs, dots |
| `--accent-soft` | `oklch(0.92 0.06 35)` | Accent bg wash |
| `--accent-deep` | `oklch(0.42 0.12 35)` | Italic display emphasis |
| `--good` | `oklch(0.58 0.12 145)` | On-track green |
| `--warn` | `oklch(0.72 0.15 75)` | At-risk amber |
| `--bad` | `oklch(0.58 0.18 25)` | Critical red |

### Color (dark theme)

Activated via `html[data-theme="dark"]`. Overrides `--cream`, `--cream-2`, `--cream-3`, `--paper`, `--ink`, `--ink-2`, `--ink-3`, `--rule`, `--rule-2`, `--accent-soft`, `--accent-deep`, `--shadow` — see the `html[data-theme="dark"]` block in the CSS. `--accent`, `--good`, `--warn`, `--bad` stay identical across themes.

### Typography

| Role | Family | Usage |
|---|---|---|
| Display | `'Fraunces'`, `ui-serif`, Georgia, serif | `.display` headings, plan prices, KPI values, phone greeting |
| Body | `'Inter'`, `ui-sans-serif`, system-ui | All body copy, buttons, nav |
| Mono | `'JetBrains Mono'`, `ui-monospace` | Eyebrows, code snippets, timestamps, chip labels |

Google Fonts URL in use (load these):
```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap
```

**Fraunces display settings** (editorial feel — do not omit):
```css
.display {
  font-weight: 300;
  letter-spacing: -0.025em;
  line-height: 1.02;
  font-variation-settings: "opsz" 144, "SOFT" 50;
}
.display em {
  font-style: italic;
  font-variation-settings: "opsz" 144, "SOFT" 100;
  color: var(--accent-deep);
}
```

**Eyebrow style** (used on every section head):
```css
.eyebrow {
  font-family: var(--font-mono);
  font-size: 11px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--ink-3);
  display: inline-flex; align-items: center; gap: 10px;
}
.eyebrow::before { content: ""; width: 22px; height: 1px; background: var(--ink-3); }
```

### Spacing & layout

- Container: `.wrap { max-width: 1240px; margin: 0 auto; padding: 0 32px; }`
- Section vertical rhythm: `.block { padding: 120px 0; }` (compressed to ~80px on mobile)
- Default body text: 16px × `--density` (density is a tweakable scalar 0.85 / 1 / 1.15)
- Radii: cards 10–14px, buttons ~10px, pills 999px, phone frames 38px, phone screens 30px

### Shadows

```css
--shadow: 0 1px 0 oklch(0.9 0.02 60 / .6), 0 12px 32px -16px oklch(0.22 0.05 40 / .18);
```
Phone frames use a stacked shadow with an outer ring for the bezel — see `.phone-frame` in source.

### Paper grain

Global `body::before` with two dotted radial gradients creates a subtle paper texture at `opacity: .5` (light) / `.2` (dark). Preserve this — it's a lot of the editorial feel.

## Component inventory

### Global

- **Nav (sticky)** — backdrop-filter blur + translucent cream, hairline bottom border. Language toggle is a small pill with two buttons (`on` state swaps bg). Hide the `<ul>` on narrow screens.
- **Buttons** — `.btn.primary` (solid ink / cream on dark mode), `.btn.outline` (1px rule, transparent bg), `.btn.ghost` (text-only nav-level). Arrow span `.arr` picks up a 2px nudge on hover via transform.
- **Pill** — small rounded-999 status chip with colored leading dot.
- **Eyebrow** — see Typography.
- **Section head** — eyebrow + `.display` h2 + optional `.sub` paragraph.

### Hero

- 2-col grid at ≥960px, single column below. Left: pill, h1 with italic `<em>` emphasis, sub, CTA row, meta row. Right: a 480×420-ish card with an animated mini-dashboard (sidebar + KPIs + burndown SVG). Burndown animates in a loop; on mobile the card lives below the copy.
- The hero card is the `Loop` hero variant; a `Static` variant (no animation) is exposed via the Tweaks panel.

### Features grid

- 3 × 3 CSS grid at desktop, collapses to 2 × n then 1 × n. One card (`f5` — GP Portfolios) is visually distinguished with the "Exclusive to Spravio" tag; promote it slightly.
- Each card: icon + title + description + tiny visual (dots, chart, list — all inline SVG or small divs).

### How it works

- 3-col numbered steps. Each step: big serif numeral + title + body + mono code snippet. A horizontal rule runs between steps on desktop.

### Mobile app (`#mobile`)

- 2-col grid: copy left, 3 phones right. Phones are pure-CSS iPhone frames (9:19.5 aspect, notch, 30px screen radius) tilted `-2° / 0° / +2°`. On hover the tilt opens ~1°.
- Each phone shows a distinct screen: **Portfolio** (greeting + health ring + project list + tab bar), **Sprint detail** (back chevron + KPIs + burndown card + activity), **Alerts** (filter pill + 5 alert cards with critical/warn/default variants).
- Store badges: dark pill with Apple / Google Play SVG + "Download on the / App Store" and "Get it on / Google Play" label pair. Hover lifts 2px with stronger shadow.
- Responsive: at ≤960px becomes 1-col with reduced tilt; at ≤640px only the middle phone shows.

### Comparison table

- 5-col grid: Feature label + 4 vendor columns (Jellyfish, Swarmia, LinearB, **Spravio** highlighted with `.us` class — accent-washed background, bolder border). Cells use `✓` / `–` / short text (`By project` for pricing row). Sticky first column on narrow widths.

### Pricing

- 3 plan cards. Middle card `.plan.featured` gets an accent-tinted border, elevated shadow, and a "Most popular" ribbon. Price uses Fraunces at 48–56px with `<small>/mo</small>` as the suffix. Feature list uses a custom checkmark bullet.
- Billing note below ("Save 20% with annual billing · All plans include a 14-day free trial").

### Testimonials

- 3-up grid. Each quote: oversize Fraunces `"` mark (absolute-positioned, accent-deep color, low opacity), paragraph, and a horizontal author row (avatar initials circle + name + mono role).

### FAQ

- Centered section head. Vertical stack of native `<details>` elements. Closed: row of title + `+`. Open: rotates to `–` and reveals body. Use a transition on `max-height` or `grid-template-rows` for smooth expand.

### Final CTA

- Centered, oversize serif h2, two buttons side-by-side.

### Footer

- 4-col layout: brand (logo + tagline) + 3 link columns (Product, Company, Legal) + a "Locale" mono line at bottom ("✦ MADE FOR AGENCIES, WORLDWIDE").

### Tweaks panel

The floating `#tweaks` panel (bottom-right, hidden by default, toggle via a button in nav or a dev keyboard shortcut) lets you change:
- Accent hue swatches (terracotta default, plus olive, teal, plum, ink)
- Theme (light / dark)
- Density (compact / default / spacious — `--density` scalar)
- Animation intensity (0 → 1.5)
- Hero variant (Loop / Static)

**This panel is a design-tooling feature — do not ship it to production.** In the real codebase, bake in the default values (terracotta accent, light theme, density 1, animations on, hero Loop).

## Copy & i18n

All user-facing strings exist in both **English** and **Portuguese (Brazilian)** inside the inline `<script>` at the bottom of the HTML (`const i18n = { en: {...}, pt: {...} }`). Keys follow a `section.subkey` dotted convention (e.g. `hero.h1`, `pr.p2f4`, `mob.b1`).

Port these to the codebase's i18n system (next-intl, i18next, etc.). The `data-i18n` attribute applies to `textContent`; `data-i18n-html` allows inline HTML like `<em>` emphasis. Preserve the `<em>` tags in Fraunces display headings — they're the italic-accent feature, not decorative.

Language toggle in the nav flips a `lang` attribute on `<html>` and re-renders all tagged elements; default is `en`, persist choice in `localStorage`.

## Interactions & behavior

| Element | Behavior |
|---|---|
| Nav links | Smooth-scroll to `#id`, with `scroll-margin-top: 80px` on the section so sticky nav doesn't cover it |
| Lang toggle | Swap copy, persist in `localStorage` (`spravio.lang`) |
| Hero dashboard (Loop) | Burndown path animates (stroke-dasharray dash-offset), KPI values tick up once on mount, PR list rotates through stale/ok states on a ~6s loop |
| Feature cards | Hover: subtle 2px lift, border shifts from `--rule` to `--rule-2` |
| Phone tilt | Group hover on `.phones` opens the outer tilts from ±2° to ±3° and lifts the center phone 4px |
| Plan cards | Hover lift on non-featured; featured already elevated |
| FAQ | Native `<details>`; animated reveal via custom transition (see CSS) |
| Store badges | Hover: `translateY(-2px)` + stronger shadow |
| Scroll reveal | (Optional — not in the HTML) Fade/slide sections in on IntersectionObserver if the codebase already has that utility; otherwise skip |

**Reduced motion:** the HTML respects `prefers-reduced-motion: reduce` by collapsing all animation durations to 0.01ms. Keep this in the port.

## Responsive

- **≥1240px** — full container (1240 max-width, 32px gutters)
- **≥960px** — all multi-col sections (hero, mobile, features, compare) in their desktop layout
- **640–960px** — hero collapses to 1 col; mobile phones shrink tilt; features 2-col; compare becomes horizontally scrollable OR switches to per-vendor stack (choose based on codebase patterns — scroll is simpler)
- **<640px** — single column throughout; only the center phone visible in the Mobile section; nav collapses to logo + burger (hide the `<ul>`); pricing cards stack

## Icons & illustrations

All icons in the HTML are **inline SVG** — stroke-based, 1.6–2px stroke-width, `currentColor`. Lift them as-is into SVG components, or match against the codebase's existing icon set if one exists (Lucide, Phosphor, etc. — Lucide is the closest aesthetic match for the stroke weights used).

Phone mockups, burndown charts, health rings, and the hero dashboard are all hand-drawn SVG/HTML — no external assets. Keep them inline for fidelity; animations rely on the SVG being in the DOM tree.

## Assets referenced

**None.** The page is fully self-contained — no external images, no logo PNGs, no icons from CDNs. The Spravio logo is a typographic `.logo-mark` + wordmark pair defined in CSS + inline SVG.

Google Fonts is the only external dependency (Fraunces, Inter, JetBrains Mono).

## Files in this bundle

- `Spravio Landing.html` — the complete landing page, self-contained (CSS + JS inline, no external assets other than Google Fonts). ~2,300 lines.

## Implementation notes for Claude Code

1. **Start with the design tokens.** Port the `:root` variables into the codebase's token layer first. Everything else leans on them.
2. **Pick the framework** based on what the team uses. For a fresh project: Next.js app router + Tailwind v4 (can consume CSS vars natively with `@theme inline`) + next/font for Fraunces/Inter/JetBrains Mono. Alternative: Astro if the team wants zero client JS.
3. **Componentize per section.** One component per marketing section (`<Hero />`, `<Features />`, `<MobileApp />`, etc.) living in `components/marketing/`. Keep the SVG mockups inside their parent section component — they're not reused.
4. **i18n** — use the codebase's existing solution; if none, `next-intl` with `en` and `pt-BR` locales under a `/[locale]` segment. Migrate the `i18n` object verbatim.
5. **Do not ship the Tweaks panel or the `<template id="__bundler_thumbnail">`** — both are design-tool concerns, not product.
6. **Accessibility:** nav `<ul>`, `<details>` / `<summary>`, and `aria-label` on icon-only links are already correct. Add `aria-current` to the active lang toggle. Ensure color contrast on the dark theme for `--ink-3` on `--cream` — verify against WCAG AA.
7. **Performance:** preload Fraunces (used above the fold in hero). Lazy-render the Mobile section phones (heavy SVG) below-the-fold via dynamic import + IntersectionObserver if LCP is hurting.
8. **Analytics hooks:** add events on `Start free trial` clicks (nav CTA, hero CTA, each pricing plan CTA, final CTA) and on `Book a 15-min demo`. Hook these to the team's analytics layer.

## Questions to resolve with design

- Does the Tweaks panel's dark-mode default need to be exposed as a user-facing toggle in production? (Currently no such toggle is specified in nav.)
- Are the vendor names in the Comparison table (Jellyfish, Swarmia, LinearB) approved by legal for public marketing?
- Real testimonial attribution — the current names (Rafael Mendes, Patricia Souza, João Oliveira) are placeholders. Replace with real customers before launch.
- Exact pricing ($49 / $149 / $399) — confirm these are final, not directional.
