# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo layout

Bun workspaces. Two apps, no shared packages.

```
workflows-people/
├── package.json            # workspace root (workspaces: apps/*)
├── bun.lockb, bunfig.toml, .prettier{rc,ignore}, .gitignore
├── CLAUDE.md, README.md, docs/
└── apps/
    ├── app/                # @workflows-people/app — React + Vite SPA (main product)
    └── marketing/          # pulse-hr-marketing — Astro marketing site
```

## Commands

Bun is the package manager and runtime. `.env` auto-loaded; no dotenv.

Run from repo root:

```bash
bun install                 # install all workspace deps
bun run dev                 # app: vite dev on :5173
bun run dev:marketing       # marketing: astro dev on :4321
bun run build               # build both apps (filter '*')
bun run build:app           # app only
bun run build:marketing     # marketing only
bun run lint                # eslint in app
bun run format              # prettier write across repo
```

Or `cd apps/app` / `cd apps/marketing` and run the package's own scripts.

Icons were rasterized once (SVG → PNG) with `sharp` in a scratch `/tmp` project; `sharp` is NOT a repo dep. Regenerate only if `apps/app/public/icon.svg` changes — install `sharp` in a scratch dir, do not add it here.

## Architecture

Pulse HR mock — TanStack Router SPA under `apps/app/` (migrated off TanStack Start SSR for Vercel). All state is in-memory; no backend. Every page seeds from `apps/app/src/lib/mock-data.ts` into local React state and performs CRUD on that state, persisting nothing across reloads. Paths below are relative to `apps/app/` unless noted.

### Routing

File-based via `@tanstack/router-plugin/vite` with `autoCodeSplitting`. Routes live in `src/routes/*.tsx`; `src/routeTree.gen.ts` is auto-generated — do not hand-edit. `src/router.tsx` builds the router; `src/main.tsx` mounts `<RouterProvider>` inside `<ThemeProvider>`.

`src/routes/__root.tsx` branches layout by path prefix. Public prefixes `["/landing", "/login", "/signup"]` render a bare `<Outlet />`; everything else renders `<AppShell />` (sidebar + Topbar + Outlet). Titles are kept via a `TITLE_BY_PATH` map + `useEffect` because we're SPA, not SSR.

### App shell

`src/components/app/AppShell.tsx` owns:

- Desktop sidebar (`hidden lg:flex`) with grouped nav (`Overview`/`People`/`Work`/`Money`/`Insights`/`Labs`/`Workspace`). Mobile uses a `<Sheet>` drawer triggered by a hamburger, auto-closes on route change.
- Topbar: ⌘K opens `CommandPalette`, ⌘J opens `CopilotOverlay`. Both overlays are global.
- Exports `PageHeader`, `Avatar`, `StatusBadge` — used by every route. `title` accepts `ReactNode` so role themes + NEW badges can inline.

### Labs features

Five "NEW"-badged features live together in a Labs sidebar group and share a visual language (iridescent border, pulse-dot, new-badge utilities in `styles.css`):

- `/pulse` — anonymous vibe check + heatmap
- `/forecast` — commessa burn projection with scenario sliders
- `/kudos` — peer coins, leaderboard, confetti (`.confetti-piece`)
- `/focus` — deep-work timer with auto-decline
- Copilot — global ⌘J overlay (`src/components/app/Copilot.tsx`), streaming fake answers + runnable actions that toast and/or navigate.

### Theme system

`src/components/app/ThemeProvider.tsx` owns 7 themes (`light`, `dark`, plus role variants `employee`, `hr`, `admin`, `manager`, `finance`). Selection writes `data-theme` on `<html>` and toggles the `.dark` class for shadcn's few `dark:` utilities. Persisted in `localStorage["pulse.theme"]`. A flash-prevention IIFE in `index.html` applies the theme before React paints. Every token lives in `src/styles.css` under `html[data-theme="…"]` selectors; dark variants share a baseline block, each role theme overrides `--primary`/`--ring` + shifts `--background` hue a few degrees.

### Domain

Types + seeds all in `src/lib/mock-data.ts`: employees, commesse (projects), timesheets, leave, expenses, payroll runs + payslips, candidates + job postings, onboarding workflows, docs, api keys/webhooks/custom fields, roles, audit log, copilot suggestions, pulse entries, kudos, focus sessions, announcements, plugins. The `commessa` concept (Italian for project code) is central — Time, Forecast, and Focus all pivot on `commessaId`.

CRUD pattern on every list route:

1. `useState(seed)` from mock-data.
2. `setTimeout(…, ~420ms)` loading simulation → `<SkeletonRows>` / `<SkeletonCards>` → `<EmptyState>` → staggered list (`.stagger-in` CSS, nth-child animation-delay).
3. Edits via side panel or `<Dialog>` form; delete via `<AlertDialog>` confirm + toast with `action: { label: "Undo", onClick: … }` that prepends the removed item back.

### Deploy

Two separate Vercel projects, one per app. Each project sets **Root Directory** to its `apps/<app>` path; Vercel auto-detects the Bun workspace and installs from the monorepo root.

- `apps/app/vercel.json` — framework `vite`, build `bun run build`, SPA rewrite `/(.*) → /index.html`, 1-year immutable cache on `/assets/*`.
- `apps/marketing/vercel.json` — framework `astro`, build `bun run build`, output `dist`.
- Root `.vercelignore` strips tooling dirs for both projects.

### PWA

`vite-plugin-pwa` in `generateSW` mode, `autoUpdate` registration. Icons in `public/` (192/512/maskable-512/180/32/svg). `src/main.tsx` wires `registerSW` to toast "New version available" (with Reload action) and "Ready to work offline". Google Fonts are runtime-cached via `CacheFirst`. SPA fallback via `navigateFallback: "/index.html"`.

## Conventions

- **Styling**: Tailwind 4 (CSS-first config inside `src/styles.css`). shadcn components in `src/components/ui/`; do not re-skin them — theme via tokens only. Fonts: Fraunces for `.font-display`, Geist body, JetBrains Mono for `.font-mono` / `code` / `kbd`.
- **Motion**: shared utilities (`fade-in`, `pop-in`, `stagger-in`, `press-scale`, `shimmer`, `pulse-dot`, `iridescent-border`, `new-badge`, `confetti-piece`, `typing-dot`) live in `styles.css @layer utilities`.
- **Responsive**: tables sit in Cards with `overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]`. Recruiting kanban gets a horizontal scroll wrapper on `< md`. Page padding is `p-4 md:p-6`. `SidePanel` is capped at `min(width, 100vw)`.
- **Toasts**: `sonner` — `toast.success` for confirmations, plain `toast` for undo-able deletes, `toast.error` for rejections. Icon prop accepts a lucide node.
- **Bun**: prefer `bun` / `bunx` over `node` / `npx`; `bun test` for tests. The `.cursor/rules` file pushes Bun APIs (`Bun.serve`, `bun:sqlite`, etc.) but this project is a Vite SPA — keep Vite for dev/build; only use Bun APIs if adding server code later.
- **Commits**: recent history style is short imperative subject + a body describing the "why". Conventional Commits not enforced.
