# Development guide

First-run notes, seed data, and troubleshooting. For architecture, see [`../ARCHITECTURE.md`](../ARCHITECTURE.md).

## Prerequisites

- [Bun](https://bun.com) ≥ 1.3 (`curl -fsSL https://bun.sh/install | bash`)
- Git
- A modern browser (Chrome/Firefox/Safari current)

No Node, npm, pnpm, or yarn required.

## First run

```bash
git clone https://github.com/davide97g/pulse-hr.git
cd pulse-hr
bun install

# Copy env files
cp apps/app/.env.example apps/app/.env
cp apps/api/.env.example apps/api/.env

# Run migrations (API)
bun run db:migrate

# Start app + api together
bun run dev
```

Open <http://localhost:5173>.

## Scripts reference

| Script                    | What it does                     |
| ------------------------- | -------------------------------- |
| `bun run dev`             | app (5173) + api together        |
| `bun run dev:app`         | app only                         |
| `bun run dev:api`         | api only                         |
| `bun run dev:marketing`   | marketing site on :4321          |
| `bun run build`           | build app + api                  |
| `bun run build:marketing` | build marketing site             |
| `bun run preview`         | preview built app                |
| `bun run lint`            | eslint (app)                     |
| `bun run format`          | prettier write across repo       |
| `bun run db:migrate`      | run API migrations               |
| `bun run studio:reel`     | Remotion studio for demo videos  |
| `bun run render:reel`     | render all Remotion compositions |

## Environment variables

Each app has its own `.env.example` — copy to `.env` and fill in.

- `apps/app/.env` — client config (API base URL, feature flags)
- `apps/api/.env` — server config (DB URL, secrets, provider keys)

Bun auto-loads `.env`; no `dotenv` import required.

## Seed / mock data

The product app boots from `apps/app/src/lib/mock-data.ts` for routes that aren't wired to the real API yet. Pattern for every list route:

1. `useState(seed)` from mock-data
2. `setTimeout(…, ~420ms)` → `<SkeletonRows>` / `<SkeletonCards>` → `<EmptyState>` → staggered list
3. Edits via `<SidePanel>` / `<Dialog>`; deletes via `<AlertDialog>` + undo toast

When porting a route to the real API, keep the skeleton/empty/stagger UX.

## Troubleshooting

**`bun install` fails on a fresh clone**
Delete `node_modules` and `bun.lockb`, then rerun. Make sure you're on Bun ≥ 1.3 (`bun --version`).

**`routeTree.gen.ts` out of date**
Regenerated automatically by the TanStack Router vite plugin on dev. Restart `bun run dev:app` if you added a new route file and it doesn't pick up.

**Theme flashes on load**
The flash-prevention IIFE in `apps/app/index.html` must run before React mounts. If you see FOUC, check you haven't broken the `<script>` order in `index.html`.

**Port already in use**
App: `vite --port 5174 …` or kill `:5173`. API: change `PORT` in `apps/api/.env`.

**Database errors on first run**
Run `bun run db:migrate`. Check `DATABASE_URL` in `apps/api/.env`.

## Editor setup

- VS Code with ESLint + Prettier + Tailwind CSS IntelliSense extensions.
- Format on save, `prettier` as default formatter.
- Workspace TS version: use the one from `apps/app/node_modules/typescript`.
