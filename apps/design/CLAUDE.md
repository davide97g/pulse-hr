# @pulse-hr/design — Storybook

Design system front-end. Deployed to `design.pulsehr.it`. Consumes `@pulse-hr/tokens` + `@pulse-hr/ui`.

## Structure

```
apps/design/
├── .storybook/
│   ├── main.ts       # stories glob pulls from ../../packages/ui/src/**/*.stories.tsx + ../docs/**/*.mdx
│   └── preview.tsx   # theme decorator cycling all 7 themes via 🎨 toolbar
├── docs/
│   ├── Introduction.mdx
│   ├── Principles.mdx
│   ├── foundations/
│   │   ├── Color.mdx
│   │   ├── Swatches.stories.tsx    # renders --* tokens as a grid under active theme
│   │   ├── Typography.mdx
│   │   └── Motion.mdx
│   └── patterns/     # TODO: composition recipes
├── src/preview.css   # Tailwind + tokens + @source glob
└── vercel.json
```

## Running locally

```bash
bun run dev:design       # serves on :6006
bun run build:design     # produces storybook-static/ for Vercel
```

## Adding a story

Co-locate next to its component:

```
packages/ui/src/primitives/button.tsx
packages/ui/src/primitives/button.stories.tsx   # ← here
```

Follow CSF3. The theme toolbar works automatically — no per-story config needed.

## Adding a principle page

Create an MDX file under `docs/` with a `<Meta title="..." />` block at the top. Storybook globs it automatically.

Long-form source material lives in `docs/brand/` at the repo root. Keep prose here short and link out for depth.

## Deploying

Vercel project rooted at `apps/design`, framework "Other", build `bun run build`, output `storybook-static`, domain `design.pulsehr.it`. No runtime env vars.
