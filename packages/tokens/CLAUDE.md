# @pulse-hr/tokens

Zero-dep design token package. CSS variables + TypeScript constants. Consumed by every app (apps/app, apps/feedback, apps/marketing, apps/reel, apps/design).

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

### Remotion (apps/reel) / JS

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

## Don't

- Don't hard-code hex in component files. Use tokens.
- Don't introduce new `--wp-*` aliases. That namespace is deprecated and scheduled for removal once marketing migrates.
- Don't add motion utilities outside `motion.css`. One source of truth for the motion vocabulary.
- Don't create a new theme without updating `THEMES` in `index.ts` and adding a story decorator entry in `apps/design/.storybook/preview.tsx`.
