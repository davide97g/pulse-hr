# Pulse HR — Aesthetic Direction

**How it should feel.**

This document is the third brand file. `foundation.md` owns the *why*, `identity.md` owns the *what* (color primitives, font stack, logo). This one owns the *how it feels* — the 2026 direction we're taking, the experiential intent, and the concrete CSS-level moves that get us there.

Written April 2026 by Davide, synthesized from a Cowork session. Living document — edit as the product evolves, flag changes in commit messages. Where this file and `identity.md` disagree on feel, this file wins; where they disagree on primitives (hex values, font names), `identity.md` wins.

---

## 0. The one-line aesthetic

> **Quiet, dark, translucent. Lime as spark. No party tricks.**

Every visual decision downstream is judged against that sentence. If a proposed thing is loud, opaque, multi-colored, or clever-for-its-own-sake, it fails. If it's quiet, translucent, monochrome-with-a-spark, and functional, it passes.

The aesthetic cousins are **Linear** (precise, dark, anti-enterprise), **Vercel v0** (minimal chrome, content-forward), **Framer's 2025 refresh** (soft gradients, dimensional glass), and **Attio** (dense-but-lightweight tool UI). Not Raycast-playful, not Basecamp-verbose, not Stripe-corporate.

---

## 1. The six principles

Every page, every component, every animation should be defensible against at least three of these. If something clearly serves none, it doesn't ship.

### 1.1 Lightweight

Nothing feels heavy. Cards don't sit on the page — they hover in it. Tables don't crowd the viewport — they breathe. Scroll is fluid, not laden. The app should feel like it weighs less than the work you're doing inside it.

### 1.2 Translucent, not opaque

Surfaces are glass, not paper. `backdrop-filter: blur()` + `color-mix()` for partial transparency + a 1px inner-top highlight. Background bleeds through at 10–20%. The user senses depth without being told about it.

### 1.3 Quiet as default, loud on purpose

The baseline is monochrome — warm ink, cream, muted grays. Color appears only where it carries meaning: a lime CTA, a coral danger state, a pulse-dot on "live." When something IS loud, it's because it earned the attention.

### 1.4 Editorial, not enterprise

Headlines are big and serif. Body text is calm and sans. Monospace appears as texture (eyebrows, labels, numbers), not ornament. The rhythm of a Pulse page should read more like a magazine spread than a dashboard.

### 1.5 Motion has a reason

One signature motion (pulse-dot). Three functional supports (fade-in, press-scale, skeleton). Everything else is retired. A page that sits still is not failing — it's working.

### 1.6 Two rooms, one world

Marketing and product are both dark. They feel related but serve different moods: marketing has editorial rhythm, product has tool-focused density. The lighting is the same; the furniture is different.

---

## 2. Seven moves that land this (what changes from today)

Each move is a concrete departure from what's currently in the repo. Implementation sketches are indicative, not prescriptive — the point is the direction.

### 2.1 Collapse 7 themes → 2

**Before:** light, dark, employee, hr, admin, manager, finance. Each swaps `--primary` and shifts `--background` hue.

**After:** light, dark. Role identity survives as *chips*, not themes:

```tsx
// A role chip appears next to an avatar or in a page header.
// It's 6px dot + monospace label. One chip per surface, max.
<RoleChip role="hr" />
//   <span class="size-[6px] rounded-full bg-coral" />
//   <span class="font-mono text-[11px] uppercase tracking-[0.25em]">HR</span>
```

**Retired hex values** that live today as full theme primaries but become chip-only accents:

| Role     | Chip color       | Usage                                               |
|----------|------------------|-----------------------------------------------------|
| Employee | lime `#b4ff39`   | same as brand; no chip needed, default state        |
| HR       | coral `#ff8a7a`  | people-ops chips, empathetic surfaces               |
| Admin    | cyan `#6fd8ff`   | system/admin chips, config surfaces                 |
| Manager  | amber `#ffbf4a`  | manager-view chips, approval states                 |
| Finance  | violet `#c48fff` | finance chips, payroll surfaces                     |

**Code impact:** delete ~200 lines from `apps/app/src/styles.css` where `html[data-theme="employee"]` etc. redeclare the entire palette. Keep role colors as CSS variables, use them in chip components only.

### 2.2 Retire loud signatures

**Retired:**

- `.iridescent-border` (rotating conic-gradient ring on cards) — too techno-shimmer.
- `.new-badge` animated gradient (`linear-gradient(110deg, #b4ff39, #39e1ff, #c06bff)` with `newBadgeShift`) — too party-trick.
- `.shimmer` used as feature-card decoration — keep only for skeletons.
- `.stagger-in` cascades — content arrives in one fade, not a wave.
- `.confetti-piece` on kudos — replace with a single pulse-dot burst.
- `.typing-dot` triple-dot on Copilot — replace with a single shimmer line.

**Replaced with one quiet system:**

```css
/* The entire "NEW / experimental / live" accent system */
.accent-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--primary);
  box-shadow: 0 0 12px color-mix(in oklch, var(--primary) 60%, transparent);
}

.chip-new {
  font-family: var(--wp-font-mono);
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--labs);
  background: color-mix(in oklch, var(--labs) 8%, transparent);
  border: 1px solid color-mix(in oklch, var(--labs) 16%, transparent);
  padding: 2px 8px;
  border-radius: 9999px;
}
```

No animation. No gradient. The lime glow on `.accent-dot` is the one "spark" moment and it doesn't move.

### 2.3 Shift shadow-grounding → blur-floating

This is the **single biggest feel change**. Every floating surface (cards, popovers, panels, overlays, tooltips, dropdowns) adopts the glass treatment.

```css
/* The canonical floating-surface class.
   Applies to Card, Popover, Dialog, Sheet, CommandPalette, Copilot, Dropdown, Tooltip.
*/
.surface-float {
  background: color-mix(in oklch, var(--background) 82%, transparent);
  backdrop-filter: blur(24px) saturate(130%);
  -webkit-backdrop-filter: blur(24px) saturate(130%);
  border: 1px solid color-mix(in oklch, var(--foreground) 7%, transparent);
  border-radius: 16px;
  box-shadow:
    /* 1px inner-top highlight — the "glass edge" */
    inset 0 1px 0 0 color-mix(in oklch, white 6%, transparent),
    /* warm ambient — replaces harsh black drop-shadow */
    0 32px 60px -24px color-mix(in oklch, var(--primary) 14%, transparent),
    0 8px 16px -8px color-mix(in oklch, black 40%, transparent);
}

/* Variant for deeply-floating elements (command bar, copilot overlay) —
   stronger blur, larger ambient glow, larger radius. */
.surface-float-lg {
  background: color-mix(in oklch, var(--background) 72%, transparent);
  backdrop-filter: blur(40px) saturate(140%);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 0 color-mix(in oklch, white 8%, transparent),
    0 80px 160px -40px color-mix(in oklch, var(--primary) 18%, transparent),
    0 20px 40px -20px color-mix(in oklch, black 50%, transparent);
}
```

**What this replaces:**

```css
/* Retire these from styles.css */
--shadow-card:  0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3);
--shadow-panel: -8px 0 32px -8px rgba(0,0,0,0.6);
--shadow-pop:   0 8px 32px -8px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.4);
```

**Performance note:** `backdrop-filter` is well-supported in 2026 (Safari 18, Chrome 130+, Firefox 115+). Graceful fallback for the handful of users without: solid `background: var(--background)` with the same border. Test on low-end Android and Linux Firefox before shipping.

**Accessibility note:** ensure contrast between surface text and the mixed-through background is AA — check `--foreground` against `color-mix(background 82%, underlying-content)` in realistic scenes, not on a flat backdrop.

### 2.4 Lime — keep exact, use rarely

Hex stays `#b4ff39`. Treatment changes.

**The rule:** one lime element per surface, max. If you're adding a second, you're overspending. Count lime appearances like you'd count cups of coffee — each one diminishes the one before.

**Where lime appears:**

1. **Primary CTA** — one per surface. "Sign up." "Install." "Save." Never two primary buttons in the same view.
2. **Active tab underline** — 1px line, full width of tab label, not the whole tab cell.
3. **`accent-dot` on "live"/"now" states** — the one at §2.2 above. Has a subtle lime glow.
4. **Selection highlight** — `::selection { background: #b4ff39; color: #0b0b0d; }`. (Already in marketing `global.css`, keep.)
5. **Surface glow** — the ambient lime tint baked into `.surface-float` shadows. Not a visible color; an atmosphere.

**Where lime must NOT appear:**

- Link colors in body text (use `--foreground` with underline).
- Borders of decorative cards (use neutral border).
- Filled backgrounds of ANY element larger than a button (no "lime card," ever).
- Sidebars, navigation chrome, or any persistent UI region.
- Status messages (success uses green hue shift via `--success`, not raw lime).

### 2.5 Editorial-big typography

Hero H1 gets meaningfully larger than it is today. Body stays calm. Monospace gets more visible.

```css
@layer utilities {
  /* Display — Fraunces Variable, italic for emphasis */
  .type-hero-h1 {
    font-family: var(--wp-font-display);
    font-weight: 500;
    font-size: clamp(56px, 8vw, 128px);
    line-height: 0.95;
    letter-spacing: -0.03em;
  }

  .type-section-h2 {
    font-family: var(--wp-font-display);
    font-weight: 500;
    font-size: clamp(40px, 5vw, 64px);
    line-height: 1.0;
    letter-spacing: -0.02em;
  }

  .type-feature-h3 {
    font-family: var(--wp-font-display);
    font-weight: 500;
    font-size: clamp(24px, 3vw, 32px);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  /* Body — Geist Variable */
  .type-body {
    font-family: var(--wp-font-sans);
    font-size: 17px;
    line-height: 1.6;
  }

  .type-body-sm {
    font-family: var(--wp-font-sans);
    font-size: 14px;
    line-height: 1.55;
  }

  /* Eyebrow / label — JetBrains Mono, UPPERCASE, wide tracking */
  .type-eyebrow {
    font-family: var(--wp-font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
  }

  /* Inline mono (kbd, code, IDs) */
  .type-mono {
    font-family: var(--wp-font-mono);
    font-size: 13px;
  }
}
```

**The italic rule (from `identity.md` §5):** one italic word per headline, not two. The italic carries the emotional weight. `"HR software for people who *hate* HR software."` works. `"HR software *for people* who hate HR software."` dilutes both italicized words into noise.

**Product vs. marketing:** marketing site uses the full editorial scale — H1 at 128px on a big screen, no apology. Product app uses H2 scale max (~32px) for page titles; H1 scale is reserved for empty states and onboarding surfaces where the product is talking, not doing.

### 2.6 Motion — one signature + 3 supports

**Signature: `pulse-dot`.** It is Pulse's brand motion. It appears on any "live/now/active" affordance: a current timer, an active Kudos receiver indicator, a `LIVE` chip on Focus, the cursor-blink in the ⌘K search bar. It does not appear for decoration.

```css
.pulse-dot::after {
  /* Already in styles.css — keep as-is */
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 9999px;
  border: 2px solid currentColor;
  opacity: 0.6;
  animation: pulseRing 1.6s ease-out infinite;
}
```

**Supports — only these three remain:**

1. `.fade-in` — content appears. Duration 220ms, ease-out. Used on route mount, on new items arriving.
2. `.press-scale` — click feedback on interactive elements. 120ms, `scale(0.97)`. Keeps the product feeling responsive.
3. `.shimmer` / skeleton loaders — used on loading states only (currently also used as feature-card decoration — retire the decorative usage).

**Retired motion utilities** (delete from `styles.css`):

- `stagger-in` and its nth-child cascade
- `pop-in`
- `iridescent-border` rotation
- `newBadgeShift` keyframes
- `confetti-piece` keyframes
- `typing-dot` keyframes
- `animate-marquee`

Result: `styles.css` shrinks by ~150 lines. The motion budget is small on purpose. When something moves, it means something.

### 2.7 Marketing refinement (same dark world, warmer rhythm)

Marketing and product both stay dark. The refinements that make marketing feel distinct are compositional, not palette-level:

- **Warmer ink baseline** — marketing background goes from `#0b0b0d` to `#0c0a08` (a hint warmer), subtle but perceptible.
- **Bigger padding rhythms** — sections have `py-32` or larger. The app has `p-4 md:p-6`; marketing doubles that.
- **Editorial type scale** (§2.5) — hero at 128px. Marketing earns the big type.
- **Longer hold times on motion** — where the app uses `fade-in` at 220ms, marketing uses 420ms. The story has time; the tool doesn't.
- **One column for prose, wide margins** — blog posts, content pages at `max-w-prose` with wide left gutters. Not the full-bleed hero grid.
- **Mono eyebrows more present** — each section gets a `DOCS`, `PRICING`, `CASE STUDY` eyebrow label. Product app uses eyebrows sparingly.

The lighting is the same. The furniture is different.

---

## 3. Surface hierarchy — the four tiers

Everything on screen lives at one of four elevations. Each has a defined surface spec.

### Tier 0 — Page

The background of the app or marketing page. Warm ink (`#0b0b0d` product, `#0c0a08` marketing). No blur, no glow, no motion. This is the dim room the rest of the UI floats inside.

### Tier 1 — Ground

Content that belongs *to* the page: sidebar, topbar, sticky footers, the inline content of a route. Sits flat. Uses `--background` or `--sidebar` tokens. No blur, minimal border (if any).

### Tier 2 — Float

The `.surface-float` class from §2.3. Cards, popovers, dropdown menus, tooltips, the mobile sheet drawer, side panels. Translucent, blurred, with lime-warm ambient glow.

### Tier 3 — Float-lg

The `.surface-float-lg` class. Reserved for the **star** overlays: the ⌘K command palette, the ⌘J Copilot overlay, a full-screen modal dialog. Stronger blur, larger radius, deeper glow. These are the moments that should feel the most "floating" — they're the brand's signature UI gesture.

| Tier | Example                      | Blur  | Border              | Glow            | Radius |
|------|------------------------------|-------|---------------------|------------------|--------|
| 0    | Page body                    | —     | —                   | —                | —      |
| 1    | Sidebar, topbar              | —     | 1px `--sidebar-border` | —             | 0      |
| 2    | Card, Popover, Tooltip       | 24px  | 1px foreground/7%   | lime/14% @ 32px | 16px   |
| 3    | ⌘K, ⌘J, full-screen dialog   | 40px  | 1px foreground/10%  | lime/18% @ 80px | 20px   |

---

## 4. What we keep, what we kill — summary tables

For the dev (or agent) implementing this, here's the explicit before/after.

### Keep (unchanged)

- `--wp-color-brand: #b4ff39` and all primitive tokens in `packages/tokens/`.
- `.press-scale` motion.
- `.pulse-dot` motion.
- `.accent-dot` (quiet 6px lime dot).
- Three-font stack: Fraunces / Geist / JetBrains Mono.
- Dark base in both apps.
- `::selection` lime highlight.
- Hero H1 italic-word pattern (`[punch][italic]<span>.</span>`).

### Refine

- `.fade-in` — keep, but it's now one of only three motions; no stagger cascade.
- `.shimmer` — keep for skeletons only; retire decorative usage.
- Surface elevations — rebuild as `.surface-float` and `.surface-float-lg` (§2.3).
- Type scale — expand to editorial-big (§2.5).
- Role colors — collapse from themes to chips (§2.1).

### Retire

- `.iridescent-border` + the rotating `borderSheen` keyframes.
- `.new-badge` + the `newBadgeShift` gradient keyframes.
- `.stagger-in` and all `nth-child` delay rules.
- `.pop-in`.
- `.confetti-piece` + `confettiFall` keyframes.
- `.typing-dot` + its staggered keyframes.
- `.animate-marquee`.
- The 5 role theme blocks (`html[data-theme="employee" | "hr" | "admin" | "manager" | "finance"]`).
- The `grid-bg` utility (use sparingly if at all — it's visual noise we don't need).
- Heavy black box-shadows (`--shadow-card`, `--shadow-panel`, `--shadow-pop` in their current black-tinted form).

---

## 5. Implementation path

Not a full migration plan, but a sequence that de-risks the aesthetic shift:

**Phase 1 — tokens & retire (1–2 days of focused work):**
1. In `apps/app/src/styles.css`: delete 5 role theme blocks. Role colors survive as chip-only CSS vars.
2. Delete `.iridescent-border`, `.new-badge`, `.stagger-in`, `.pop-in`, `.confetti-piece`, `.typing-dot`, `.animate-marquee`, `.grid-bg` utility rules and their keyframes.
3. Ship. The app will look starker but nothing will break functionally.

**Phase 2 — surface system (2–3 days):**
1. Add `.surface-float` and `.surface-float-lg` utilities.
2. Migrate shadcn `Card`, `Popover`, `DropdownMenu`, `Tooltip`, `Sheet`, `Dialog` to use them.
3. Upgrade `CommandPalette` and `CopilotOverlay` to `.surface-float-lg`.
4. Fallback path for non-blur-supporting browsers (solid bg).

**Phase 3 — typography + motion (1–2 days):**
1. Add `.type-*` utilities per §2.5.
2. Reclaim hero pages: `/landing`, `/login`, `/signup`, the empty states on every list route.
3. Replace surviving motion utilities into the curated set (pulse-dot, fade-in, press-scale, shimmer-skeleton).
4. Audit for any remaining `stagger-in`, `iridescent-border` consumers and remove.

**Phase 4 — marketing refinement (1 day):**
1. Apply the rhythm changes from §2.7 — warmer ink, bigger padding, editorial type scale, eyebrow labels.

Each phase should ship to `main` as its own PR. After Phase 1 the app looks different. After Phase 3 it feels different.

---

## 6. What this does NOT change

Set expectations. This aesthetic shift touches feel, not function:

- **The domain model is untouched** — mock-data, routing, the commessa pivot, all Labs features, the persistence layer.
- **shadcn components stay** — we don't re-skin or replace them. We theme them with tokens.
- **Icon set stays** — `lucide-react` / `lucide-astro`.
- **Copy stays** — every headline, every banned phrase, every `commessa` usage is governed by `foundation.md` §10 and `identity.md` §6.
- **The logo (Sparkles placeholder) stays** — commissioning a custom mark is its own project, `identity.md` §11 phase-2 backlog.
- **Theme-switching UX survives** — users can still pick light or dark in settings. They just can't pick "role-themed" anymore.

---

## 7. Open questions — aesthetic TBDs

Flagging honestly, same style as `foundation.md` §15:

- **Light mode treatment.** We decided both modes exist, both refined. But light mode specs above are implicit. Needs its own pass: what do surfaces, glass, and glows look like when the background is cream?
- **Role chip shape.** Dot + monospace label is the proposed default. But on dense tables (e.g., employee list), do chips take too much room? Consider a 6px-dot-only variant for row contexts.
- **Glass color temperature.** The ambient glow tint is lime by default. Does it ever shift? (e.g., coral in HR-context overlays, or is that too clever?)
- **Contrast under blur.** AA compliance requires empirical testing with real content behind glass surfaces. Budget a day for this per `design:accessibility-review`.
- **Labs group visual.** Labs features (Pulse, Forecast, Kudos, Focus, Copilot) currently share the `iridescent-border` as a visual group. What's the replacement? Proposed: a subtle 1px lime top-border + the `chip-new` label in the card corner. Needs a mock.
- **Mobile breakpoints & density.** Editorial-big H1 at 128px needs aggressive `clamp()`. Sidebar sheet drawer — glass or solid on mobile?
- **Animation on reduced-motion.** Every utility above needs a `@media (prefers-reduced-motion: reduce)` path. Currently `styles.css` doesn't have one. Budget a half-day.

---

## 8. The sentence to remember

When you're reviewing a proposed screen, ad, reel, sticker, slide, or component — say it out loud:

> **Quiet, dark, translucent. Lime as spark. No party tricks.**

If the screen doesn't match that sentence, you're not finished.

---

*This document lives at `docs/brand/aesthetic.md`. Paired with `foundation.md` (conceptual brand) and `identity.md` (primitive specs). Keep all three in sync when the brand evolves.*
