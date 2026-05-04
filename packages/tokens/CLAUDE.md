# @pulse-hr/tokens

Zero-dep design token package. CSS variables + TypeScript constants. Consumed by every app (apps/app, apps/feedback, apps/marketing, apps/studio, apps/design).

## Structure

```
src/
├── index.css           # aggregator: base + tokens + motion
├── tokens.css          # @theme inline + calendar + imports all 7 themes
├── base.css            # @layer base (fonts, resets)
├── motion.css          # @layer utilities (fade-in, pop-in, etc.)
├── wp-aliases.css      # DEPRECATED compatibility shim for legacy --wp-* names
├── themes/
│   ├── _base-dark.css  # dark baseline shared by dark, employee, hr, admin, manager, finance
│   ├── light.css       # :root palette (default when data-theme unset)
│   ├── dark.css        # neutral dark (indigo)
│   ├── employee.css    # signature lime (default in apps)
│   ├── hr.css          # coral
│   ├── admin.css       # electric cyan
│   ├── manager.css     # amber
│   └── finance.css     # violet
├── index.ts            # typed exports: token, hex, font, radius, duration, ease, shadow, THEMES
└── tailwind.ts         # JS Tailwind preset (rarely needed — Tailwind v4 CSS-first prefers tokens.css)
```

## Consuming

### React / Vite (apps/app, apps/feedback, apps/design)

In the app's `styles.css`:

```css
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
@import "@pulse-hr/tokens/index.css";
```

Plus the flash-prevention IIFE in `index.html` that sets `<html data-theme="employee" class="dark">` before React paints.

### Astro (apps/marketing)

```css
@import "tailwindcss";
@import "@pulse-hr/tokens/index.css";
@import "@pulse-hr/tokens/wp-aliases.css";  /* remove when migrated off --wp-* */
```

Set `data-theme="employee" class="dark"` on the `<html>` element in the layout.

### Remotion (apps/studio) / JS

```ts
import { hex, font, radius } from "@pulse-hr/tokens";
```

Use `hex.*` for raw values that CSS vars can't resolve (OG images, Remotion renders, Storybook swatches). Use `token.*` for runtime `style={{ color: token.primary }}` — resolves against the active theme.

## Adding a token

1. Decide whether it's theme-dependent (lives in `themes/*.css`) or universal (lives in `tokens.css`).
2. For theme-dependent tokens, add to every theme file.
3. Add a `--color-<name>: var(--<name>);` line in the `@theme inline` block of `tokens.css` if you want Tailwind utilities (`bg-<name>`, `text-<name>`).
4. Mirror the token in `index.ts` under the right constant (`token`, `hex`, `font`, etc.).
5. Storybook `apps/design/docs/foundations/Swatches.stories.tsx` auto-renders any `--<name>` via the `SEMANTIC_TOKENS` array — add your token there to see it on the swatch grid.

## Spacing rhythm

One canonical set, used everywhere unless a route has a documented exception.

| Role | Class | Notes |
|---|---|---|
| Page padding | `p-4 md:p-6` | Owned by `container-narrow` / `container-default` / `container-wide` — page templates already apply this. Routes that don't use a template still follow it. |
| Section gap (vertical) | `space-y-6` | Between major sections inside a page. |
| Block gap (vertical) | `space-y-4` | Inside a `<ListLayout>` between header / filter / content. |
| Item gap (row/grid) | `gap-3` | Default for `<Card>` grids, KPI strips, button rows. |
| Tight gap (icon + label) | `gap-2` | Only for inline icon + text, badge clusters. |
| Card padding | `p-4` (sm) / `p-5` (md, default) / `p-6` (lg) | StatCard sizes encode this. |

Outliers worth knowing: `routes/onboarding.tsx` uses `p-24` on the welcome hero — intentional, document and leave alone.

## Container scale

Use the named container utilities defined in `containers.css`. Don't write `max-w-[1400px] mx-auto p-4 md:p-6` by hand — pick the right container.

| Class | max-width | Use |
|---|---|---|
| `container-narrow` | 880px | reading flows, single-column forms, profile detail |
| `container-default` | 1200px | dashboards, list+filter routes |
| `container-wide` | 1440px | canvas/board/org chart/calendar |

## Typography scale

Defined in `typography.css`. Use the named class instead of hand-rolled font-size + weight combos.

| Class | Use |
|---|---|
| `text-display` | hero numbers (StatCard size="lg"), welcome headlines |
| `text-page-title` | page H1 — applied automatically by the `<PageHeader>` atom |
| `text-section` | section header inside a card or panel |
| `text-subsection` | column headers, group labels |
| `text-body` | default body |
| `text-body-sm` | dense rows, table cells |
| `text-label` | KPI labels (uppercase, tracked) |
| `text-caption` | metadata, timestamps |
| `text-numeric` | any large tabular number |

Fraunces (`font-display`) is used **only** in `text-display`, `text-page-title`, and `text-numeric`. Body and labels stay on Geist.

## Iconography scale

Lucide everywhere. Pick a tier — don't invent new sizes.

| Tier | Class | Use |
|---|---|---|
| metadata | `h-3 w-3` | inline timestamps, status dots |
| default | `h-4 w-4` | buttons, list rows, header chips, ListFilterBar search |
| feature | `h-5 w-5` | StatCard md/lg, section headers |
| hero | `h-6 w-6` | empty states, onboarding cards |

## Role colour tokens

Stable per-user-role hues, defined in `themes/light.css` and `themes/_base-dark.css`. Use these to keep the role identity consistent regardless of which palette theme is active.

| Token | Tailwind utility | Mirror in `index.ts` |
|---|---|---|
| `--role-employee` | `text-role-employee` / `bg-role-employee` | `token.roleEmployee` |
| `--role-manager` | `text-role-manager` | `token.roleManager` |
| `--role-hr` | `text-role-hr` | `token.roleHr` |
| `--role-admin` | `text-role-admin` | `token.roleAdmin` |
| `--role-finance` | `text-role-finance` | `token.roleFinance` |

## Don't

- Don't hard-code hex in component files. Use tokens.
- Don't introduce new `--wp-*` aliases. That namespace is deprecated and scheduled for removal once marketing migrates.
- Don't add motion utilities outside `motion.css`. One source of truth for the motion vocabulary.
- Don't create a new theme without updating `THEMES` in `index.ts` and adding a story decorator entry in `apps/design/.storybook/preview.tsx`.
