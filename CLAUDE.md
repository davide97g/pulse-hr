# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo layout

Bun workspaces. Five deployable apps + three shared packages. Each app deploys independently.

```
pulse-hr/
├── apps/
│   ├── app/        # @workflows-people/app   → app.pulsehr.it    (Vite + React SPA — main product)
│   ├── api/        # @pulse-hr/api           → api.pulsehr.it    (Bun + Hono, hosted on Render)
│   ├── feedback/   # @pulse-hr/feedback      → feedback site     (Vite + React + TanStack Router)
│   ├── marketing/  # pulse-hr-marketing      → pulsehr.it        (Astro)
│   ├── design/     # @pulse-hr/design        → design.pulsehr.it (Storybook for the design system)
│   └── reel/       # @pulse-hr/reel          (Remotion compositions → marketing/public/reel/*)
└── packages/
    ├── shared/     # @pulse-hr/shared (sidebar features, tours, changelog data)
    ├── tokens/     # @pulse-hr/tokens (CSS variables + TS constants — sole theme source of truth)
    └── ui/         # @pulse-hr/ui     (shadcn primitives + design atoms + ThemeProvider)
```

`apps/app/recordings/` is also a workspace member (demo-recording sandbox).

The root package name is `workflows-people` for legacy reasons; the product is **Pulse HR**. Root `bunfig.toml` opts out of the text lockfile (`saveTextLockfile = false`) — `bun.lockb` is the canonical lockfile.

Subpackage-specific CLAUDE.md files exist and are the source of truth for those workspaces — read them before editing inside:

- `apps/design/CLAUDE.md` — Storybook structure, story conventions
- `packages/tokens/CLAUDE.md` — token authoring rules, theme list, consumption patterns
- `packages/ui/CLAUDE.md` — primitives vs atoms, import paths, peer-dep policy

## Commands

Bun is the package manager and runtime. `.env` is auto-loaded (no `dotenv`). Scripts use `bun run --filter` to target specific workspaces.

```bash
bun install                 # install all workspaces
bun run dev                 # app + api + feedback (parallel)
bun run dev:app             # Vite SPA only (:5173)
bun run dev:api             # Hono backend only (--hot)
bun run dev:feedback        # feedback site
bun run dev:design          # Storybook (:6006)
bun run dev:marketing       # Astro (:4321)

bun run build               # builds app + api + feedback
bun run build:app | build:api | build:feedback | build:design | build:marketing

bun run lint                # eslint in apps/app
bun run db:migrate          # apply Drizzle migrations against Neon
bun run studio:reel         # Remotion studio
bun run render:reel         # render reel.mp4 + .webm + poster into apps/marketing/public/reel/
bun run demo:record         # apps/app/recordings/scripts/run.ts
```

Or `cd apps/<name>` and run that workspace's own scripts.

`apps/app/public` PNG icons were rasterized once (SVG → PNG) with `sharp` in a scratch `/tmp` project; `sharp` is NOT a repo dep. Regenerate only if `apps/app/public/icon.svg` changes — install `sharp` in a scratch dir, do not add it here.

## Architecture

### apps/app — main product

TanStack Router SPA (migrated off TanStack Start SSR for Vercel). Paths below are relative to `apps/app/` unless noted.

**Routing.** File-based via `@tanstack/router-plugin/vite` with `autoCodeSplitting`. Routes in `src/routes/*.tsx`; `src/routeTree.gen.ts` is auto-generated — do not hand-edit. `src/router.tsx` builds the router; `src/main.tsx` mounts `<RouterProvider>` inside `<ThemeProvider>` (from `@pulse-hr/ui/theme`).

**Auth.** Clerk via `@clerk/react`. Login wall gates real features; the Demo banner (`DemoBanner`) appears for unauthenticated browsing. Workspace persona is split from the real Clerk role.

**App shell.** `src/components/app/AppShell.tsx` owns sidebar (grouped: `Overview` / `People` / `Work` / `Money` / `Insights` / `Labs` / `Workspace`), Topbar with ⌘K (`CommandPalette`) and ⌘J (`CopilotOverlay`), and a mobile `<Sheet>` drawer. Exports `PageHeader`, `Avatar`, `StatusBadge`. `src/routes/__root.tsx` branches layout by path prefix — public prefixes `["/landing", "/login", "/signup"]` render a bare `<Outlet />`; everything else renders `<AppShell />`. Titles are kept via a `TITLE_BY_PATH` map + `useEffect`.

**Data.** Real data flows through `apps/api` via a typed client. Where the backend isn't wired yet, `src/lib/mock-data.ts` seeds local React state (employees, commesse, timesheets, leave, expenses, payroll runs/payslips, candidates, jobs, onboarding, docs, api keys, webhooks, audit log, and Labs data). The **`commessa`** (Italian project code) is the pivot — Time, Forecast, and Focus all aggregate around `commessaId`.

**CRUD pattern on every list route.**
1. `useState(seed)` from mock-data (or query from API).
2. `setTimeout(…, ~420ms)` loading sim → `<SkeletonRows>` / `<SkeletonCards>` → `<EmptyState>` → staggered list (`.stagger-in` CSS, nth-child animation-delay).
3. Edits via side panel or `<Dialog>` form; delete via `<AlertDialog>` confirm + toast with `action: { label: "Undo", onClick: … }` that prepends the removed item back.

**Labs features** (NEW-badged, share visual language — iridescent border, pulse-dot, new-badge utilities):
- `/pulse` — anonymous vibe check + heatmap
- `/forecast` — commessa burn projection with scenario sliders
- `/kudos` — peer coins, leaderboard, confetti (`.confetti-piece`)
- `/focus` — deep-work timer with auto-decline
- Copilot — global ⌘J overlay (`src/components/app/Copilot.tsx`), streaming fake answers + runnable actions that toast and/or navigate.

**PWA.** `vite-plugin-pwa` in `generateSW` mode, `autoUpdate`. Icons in `public/`. `src/main.tsx` wires `registerSW` to toast "New version available" (Reload action) and "Ready to work offline". Google Fonts runtime-cached via `CacheFirst`. SPA fallback `navigateFallback: "/index.html"`.

### apps/api — backend

Bun runtime + Hono. Long-running server hosted on Render (no cold starts). Replaces the previous Vercel serverless functions that lived under `apps/app/api/*`.

- **Entry:** `src/index.ts` mounts middleware (`access-log`, `cors`, `error`) then routes: `/health`, `/comments`, `/proposals`, `/feedback`, `/changelog`, `/notifications`, `/screenshots`, `/workspace`, `/cron`, `/admin`, `/user-profile`. Listens on `process.env.PORT` (default 3000).
- **DB:** Drizzle ORM (`src/db/{client,schema}.ts`) against Neon Postgres (`@neondatabase/serverless`). Migrations in `drizzle/000N_*.sql`, applied via `bun run db:migrate` (`scripts/db-migrate.ts`).
- **Auth:** Clerk backend SDK (`@clerk/backend`).
- **Email:** Resend + React Email components (`src/emails`, `src/services/email.ts`).
- **Storage:** S3-compatible via `aws4fetch` (`src/services/storage.ts`) for screenshots.
- **Changelog:** `scripts/build-changelog.ts` runs as `prebuild` and on demand to compile MD into the data file the API serves.
- **Build:** `bun build src/index.ts --target=bun --outdir=dist`. Render deploy config in `render.yaml`; container in `Dockerfile`.

### apps/feedback — public feedback board

Vite + React + TanStack Router (separate SPA). Consumes `@pulse-hr/ui` + `@pulse-hr/tokens` + `@pulse-hr/shared`. Routes: `index`, `proposals.$id`, `comments.$id`, `voting-power`. Has its own `CLAUDE.md` worth checking when working in it.

### apps/marketing — Astro static site

Content in `src/data/*.ts` and `src/pages/*.astro`. Ships changelog, roadmap, security, ecosystem. Imports `@pulse-hr/tokens` for theme parity. Still uses `wp-aliases.css` shim for legacy `--wp-*` token names — being phased out.

### apps/design — Storybook

Hosts design-system docs at `design.pulsehr.it`. Globs stories from `packages/ui/src/**/*.stories.tsx` and MDX from `apps/design/docs/**`. Has its own `CLAUDE.md`.

### apps/reel — Remotion

Renders `DayInPulse` composition into `apps/marketing/public/reel/{reel.mp4,reel.webm,poster.jpg}`. React 18 (Remotion constraint) — do not bump to 19 here.

### Shared packages

- **`@pulse-hr/tokens`** — sole source of truth for color, font, radius, motion, shadow, themes (7: `light`, `dark`, plus role variants `employee` (default), `hr`, `admin`, `manager`, `finance`). Every consumer imports `@pulse-hr/tokens/index.css` and sets `data-theme` + `class="dark"` on `<html>` (with a flash-prevention IIFE in `index.html` before React paints). See `packages/tokens/CLAUDE.md` for token-authoring rules.
- **`@pulse-hr/ui`** — primitives (shadcn, ~46), atoms (PageHeader, EmptyState, BrandMark, SidePanel, Skeletons, NewBadge, BirthdayHalo, AvatarDisplay, ParticleField), `ThemeProvider`, `cn` util, `useIsMobile`. **Subpath imports only** (`@pulse-hr/ui/primitives/button`, `@pulse-hr/ui/atoms/PageHeader`, `@pulse-hr/ui/theme`) — no top-level barrel, deliberately, for tree-shaking. See `packages/ui/CLAUDE.md` for the primitives-vs-atoms boundary and the "promote an app component to atom" workflow.
- **`@pulse-hr/shared`** — type-only/data-only (sidebar features, tours, changelog).

## Conventions

- **Styling.** Tailwind 4 (CSS-first config). Theme via tokens only — never re-skin shadcn primitives. Fonts: Fraunces for `.font-display`, Geist body, JetBrains Mono for `.font-mono` / `code` / `kbd`.
- **Motion.** Shared utilities (`fade-in`, `pop-in`, `stagger-in`, `press-scale`, `shimmer`, `pulse-dot`, `iridescent-border`, `new-badge`, `confetti-piece`, `typing-dot`) live in `packages/tokens/src/motion.css` — one source of truth.
- **Responsive.** Tables sit in Cards with `overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]`. Recruiting kanban gets a horizontal scroll wrapper on `< md`. Page padding is `p-4 md:p-6`. `SidePanel` capped at `min(width, 100vw)`.
- **Toasts.** `sonner` — `toast.success` for confirmations, plain `toast` for undo-able deletes, `toast.error` for rejections. Icon prop accepts a lucide node.
- **Bun.** Prefer `bun` / `bunx` over `node` / `npx`; `bun test` for tests. The `.cursor/rules` file pushes Bun APIs (`Bun.serve`, `bun:sqlite`, etc.); the API uses Bun-native HTTP, but apps/app and apps/feedback are Vite SPAs — keep Vite for their dev/build.
- **Domain coupling.** Components that import `@/lib/mock-data`, `@/components/<domain>/*`, or workspace specifics belong in their consuming app, not in `@pulse-hr/ui`.
- **Theme tokens.** Don't hard-code hex; use `@pulse-hr/tokens` tokens. Don't add new `--wp-*` aliases (deprecated namespace). Don't add motion utilities outside `motion.css`.
- **Commits.** Recent style is Conventional-ish prefixes (`feat(scope):`, `fix(scope):`, `chore(scope):`, `refactor(scope):`) + short imperative subject. A body explaining the "why" is welcome but not enforced.

## Deploy

Each app has its own deploy target.

- `apps/app` → Vercel (project rooted at `apps/app`). `vercel.json`: framework `vite`, build `bun run build`, SPA rewrite `/(.*) → /index.html`, 1-year immutable cache on `/assets/*`.
- `apps/api` → Render. `render.yaml` + `Dockerfile`. Long-running Bun process.
- `apps/feedback` → Vercel (rooted at `apps/feedback`).
- `apps/marketing` → Vercel (rooted at `apps/marketing`). Framework `astro`, output `dist`.
- `apps/design` → Vercel (rooted at `apps/design`). Framework "Other", output `storybook-static`.
- `apps/reel` — not deployed; renders artifacts into `apps/marketing/public/reel/`.

Vercel auto-detects the Bun workspace and installs from the monorepo root. Root `.vercelignore` strips tooling dirs.
