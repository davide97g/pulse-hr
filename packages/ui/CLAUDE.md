# @pulse-hr/ui

Shared React component library. Three tiers:

```
src/
├── primitives/   # 46 shadcn primitives (button, card, dialog, etc.)
├── atoms/        # extracted design atoms (PageHeader, EmptyState, ParticleField, BrandMark, SidePanel, Skeletons, NewBadge, BirthdayHalo, AvatarDisplay)
├── theme/        # ThemeProvider + useTheme
├── lib/          # cn (clsx + tailwind-merge)
└── hooks/        # use-mobile
```

## Import paths

Per-subpath exports — never barrel-re-export everything (kills tree-shaking).

```ts
import { Button } from "@pulse-hr/ui/primitives/button";
import { PageHeader } from "@pulse-hr/ui/atoms/PageHeader";
import { ThemeProvider, useTheme } from "@pulse-hr/ui/theme";
import { cn } from "@pulse-hr/ui/lib/cn";
import { useIsMobile } from "@pulse-hr/ui/hooks/use-mobile";
```

## Adding a primitive (shadcn)

1. `cd packages/ui/src/primitives`
2. `bunx shadcn@latest add <name>` — or hand-write one. shadcn CLI works if it doesn't require a `components.json` (we don't have one here).
3. Rewrite its imports to relative form: `@/lib/utils` → `../lib/cn`; sibling primitives stay `./x`.
4. Write a `<name>.stories.tsx` next to it, following the pattern in `button.stories.tsx`.
5. Verify in Storybook: `bun run dev:design`.

## Promoting an app component to atom

The bar: **no domain coupling**. If the file imports from `@/lib/mock-data`, `@/components/<domain>/*`, `@/lib/workspace`, or any `@pulse-hr/app` specific path, it's not an atom.

1. Check the imports: `grep -h "from \"@/" <file>`. Only `@/lib/utils` (now `../lib/cn`) and sibling `./Atom` imports are allowed.
2. If coupled, **decouple first** — split the visual layer (atom) from the app logic (domain composite). See `Avatar` (app's `AppShell.tsx`) vs `AvatarDisplay` (atom) as the pattern.
3. `git mv apps/app/src/components/app/X.tsx packages/ui/src/atoms/X.tsx`.
4. Rewrite its imports to the package structure.
5. Codemod consumers: `find apps -name "*.tsx" -exec sed -i '' -E 's|"@/components/app/X"|"@pulse-hr/ui/atoms/X"|g' {} +`.
6. Add a re-export in `apps/app/src/components/app/AppShell.tsx` if downstream branches might have in-flight imports.
7. Add a `X.stories.tsx` in `packages/ui/src/atoms/`.

## Don't

- Don't create domain components here. `FeedbackShell`, `CompanyProfileForm`, `VotingPowerChip` live in their consuming apps.
- Don't re-skin primitives. Theme via `@pulse-hr/tokens` CSS vars; use CVA for variant proliferation.
- Don't add a top-level `index.ts` barrel that re-exports every primitive. Subpath imports are deliberate.
- Don't import from `@/` in package source. That alias is app-scoped; package files use relative paths.

## Peer dependencies

Most Radix + dnd-kit + forms deps are listed as **optional peer** so apps that don't use the heavy components (chart, calendar, carousel, resizable) don't have to install them. Tree-shaking at build time gives them zero bundle cost even if installed.

If you add a primitive with a new heavy dep, list it as optional peer in `package.json` unless it's universally needed.
