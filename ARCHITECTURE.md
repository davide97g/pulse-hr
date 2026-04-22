# Architecture

High-level tour of how Pulse HR fits together. For detailed agent-facing conventions, see [`CLAUDE.md`](./CLAUDE.md).

## Monorepo

Bun workspaces. Three deployable apps + two shared packages.

```
apps/
  app/        # @workflows-people/app   → app.pulsehr.it     (React SPA)
  api/        # @pulse-hr/api            → api.pulsehr.it     (Bun + Hono)
  marketing/  # pulse-hr-marketing       → pulsehr.it         (Astro)
  reel/       # @pulse-hr/reel           — Remotion demo videos
packages/
  shared/     # @pulse-hr/shared         — types, utils, zod schemas
  tokens/     # @workflows-people/tokens — design tokens shared by app + marketing
```

Each app owns its own `vercel.json` / deploy pipeline. Only the product + API are coupled at runtime.

## Product app (`apps/app`)

- **Stack:** React 19, Vite, Tailwind 4, shadcn/ui.
- **Router:** TanStack Router, file-based (`src/routes/*.tsx`), auto-codesplit. `routeTree.gen.ts` is generated — never hand-edit.
- **Shell:** `src/components/app/AppShell.tsx` — sidebar (grouped nav: Overview / People / Work / Money / Insights / Labs / Workspace), topbar with ⌘K command palette and ⌘J Copilot overlay.
- **State:** in-memory from `src/lib/mock-data.ts` where the backend isn't wired yet. Real data flows through `apps/api` via a typed client.
- **Theme:** 7 themes (`light`, `dark`, + role variants). Tokens in `src/styles.css` under `html[data-theme="…"]`. Flash-prevention IIFE in `index.html`.
- **PWA:** `vite-plugin-pwa` in `generateSW` mode.

## API (`apps/api`)

- **Stack:** Bun runtime + Hono.
- **Role:** serves `/api/*` for the product. Long-running server — no cold starts.
- **Domain:** employees, commesse (projects), timesheets, leave, expenses, payroll runs, payslips, candidates, jobs, onboarding, docs, api keys, webhooks, audit log, plus Labs data (pulse, kudos, focus, forecast).

## Marketing (`apps/marketing`)

Astro static site. Content lives in `src/data/*.ts` and `src/pages/*.astro`. Ships the changelog, roadmap, security, and ecosystem pages.

## Labs

Five experiments share a visual language (iridescent border, pulse-dot, new-badge):

- `/pulse` — anonymous vibe check + heatmap
- `/forecast` — commessa burn projection
- `/kudos` — peer coins + leaderboard + confetti
- `/focus` — deep-work timer with auto-decline
- Copilot — global ⌘J overlay, streaming answers, runnable actions

## Domain model

The **`commessa`** (Italian for project code) is the pivot: Time, Forecast, and Focus all aggregate around `commessaId`. All domain types live in `packages/shared`.

## Deployment

Three Vercel projects, one per app, each rooted in its `apps/<name>` directory. Vercel auto-detects the Bun workspace and installs from the monorepo root. See [`docs/self-hosting.md`](./docs/self-hosting.md) for self-host options (Docker, Helm, Terraform modules).
