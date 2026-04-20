# @workflows-people/tokens

Shared design primitives (colors, typography, radii, motion, elevation) for
every surface of the product — the React SPA at `apps/app`, the Astro
marketing site at `apps/marketing`, and anything else we add later (docs
site, OG-image generator, MCP server landing, …).

## Why this exists

Before this package existed, the brand lime, the ink background, the role
accents and the three font stacks were duplicated between
`apps/app/src/styles.css` and `apps/marketing/src/styles/global.css`. They
drifted. Fixing the drift by hand is not a use of human time.

A single source of truth lets us:

- Update the brand palette in one place.
- Use the same role-accent variable (`--wp-color-finance`) in the React
  theme system and in marketing role strips.
- Seed analytical charts (recharts in-app) and OG-image generation with
  the same colors without `import("../../apps/app/…")` acrobatics.

## Consumers

Two exports, pick the one that fits the context:

- **CSS** (Tailwind v4 CSS-first, marketing and app):
  ```css
  @import "@workflows-people/tokens/tokens.css";
  ```
  Use the `--wp-color-*`, `--wp-font-*`, `--wp-radius-*` etc. variables.

- **TypeScript** (app code, OG image generation, chart palettes):
  ```ts
  import { color, font, radius } from "@workflows-people/tokens";

  const barFill = color.role.finance;
  ```

## What belongs here

- Primitives (hex colors, font stacks, numeric radii, named easing).
- Anything used by **more than one** surface.

## What does not belong here

- Surface-specific tokens (e.g. the landing hero's exact drop-shadow).
- Component styles — tokens are atoms, not components.
- App-specific theme overrides (those live in `apps/app/src/styles.css`
  under the `html[data-theme="…"]` selectors).

## Contributing

Add a new token only if (a) it's used on at least two surfaces, or (b)
it's going to be. Gratuitous growth of this file is the exact problem
we're trying to avoid.

## License

FSL-1.1-MIT — same as the parent repository. See `/LICENSE`.
