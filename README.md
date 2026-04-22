<div align="center">
  <img src="apps/app/public/icon.svg" alt="Pulse HR logo" width="96" height="96" />

  # Pulse HR

  **An opinionated, open-source HR platform for modern teams.**

  People, time, payroll, recruiting, and a few Labs experiments (Pulse, Forecast, Kudos, Focus, Copilot) — all in one place.

  [Live app](https://app.pulsehr.it) · [Marketing site](https://pulsehr.it) · [Roadmap](https://pulsehr.it/roadmap) · [Changelog](https://pulsehr.it/changelog) · [Status](https://status.pulsehr.it)

  [![License: FSL-1.1-MIT](https://img.shields.io/badge/license-FSL--1.1--MIT-black)](./LICENSE)
  [![Built with Bun](https://img.shields.io/badge/built%20with-Bun-f9f1e1)](https://bun.com)
  [![Made with TanStack Router](https://img.shields.io/badge/TanStack-Router-ef4444)](https://tanstack.com/router)
</div>

---

## What is this?

Pulse HR is a full HR product surface — employees, commesse (projects), timesheets, leave, expenses, payroll, recruiting, onboarding, docs, api keys & webhooks — plus a **Labs** group of experimental features:

- **Pulse** — anonymous vibe-check + heatmap
- **Forecast** — commessa burn projection with scenario sliders
- **Kudos** — peer coins, leaderboard, confetti
- **Focus** — deep-work timer with auto-decline
- **Copilot** — ⌘J global overlay, streaming answers, runnable actions

It ships as a Bun monorepo you can clone, run, fork, or self-host.

## Repo layout

```
pulse-hr/
├── apps/
│   ├── app/           # @workflows-people/app — main product (Vite + React + TanStack Router)
│   ├── api/           # @pulse-hr/api — Bun + Hono backend (api.pulsehr.it)
│   ├── marketing/     # pulse-hr-marketing — Astro marketing site (pulsehr.it)
│   └── reel/          # @pulse-hr/reel — Remotion demo videos
├── packages/
│   ├── shared/        # @pulse-hr/shared — shared types & utils
│   └── tokens/        # @workflows-people/tokens — design tokens shared across apps
└── docs/              # brand assets, internal docs
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the high-level tour, and [`CLAUDE.md`](./CLAUDE.md) for agent-facing conventions (routing, theme system, domain model, Labs patterns).

## Quick setup

**Prerequisites:** [Bun](https://bun.com) ≥ 1.3. No Node required.

```bash
# 1. Clone
git clone https://github.com/davide97g/pulse-hr.git
cd pulse-hr

# 2. Install (one command, whole monorepo)
bun install

# 3. Run the app + api together
bun run dev            # app on :5173, api on its configured port

# Or run pieces individually:
bun run dev:app        # Vite SPA only
bun run dev:api        # Hono backend only
bun run dev:marketing  # Astro marketing site on :4321
```

Other useful scripts:

```bash
bun run build             # build app + api
bun run build:marketing   # build marketing site
bun run lint              # eslint (app)
bun run format            # prettier across repo
bun run db:migrate        # run API migrations
```

`.env` files are auto-loaded by Bun — no `dotenv` needed. Copy any `.env.example` in `apps/*/` to `.env` before running.

## Tech stack

- **Runtime / PM:** Bun (workspaces)
- **App:** React 19 + Vite + TanStack Router + Tailwind 4 + shadcn/ui
- **API:** Bun + Hono
- **Marketing:** Astro
- **Demos:** Remotion

## Contributing

Contributions are welcome — this project lives in the open.

- Find something to work on: [open issues](https://github.com/davide97g/pulse-hr/issues), [Discussions (feedback board)](https://github.com/davide97g/pulse-hr/discussions), [public roadmap](https://pulsehr.it/roadmap).
- Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the workflow, branching, PR checklist, and code style.
- Be kind. We follow the [Contributor Covenant](./CODE_OF_CONDUCT.md).
- Security issues → [`SECURITY.md`](./SECURITY.md) (do **not** open a public issue).

Also helpful:
- [`docs/development.md`](./docs/development.md) — first-run guide, scripts, troubleshooting
- [`docs/self-hosting.md`](./docs/self-hosting.md) — Vercel / Docker / Kubernetes deployment

## License

[FSL-1.1-MIT](./LICENSE) — source-available today, converts to MIT after two years. See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE) for the full terms. TL;DR: you can read, fork, self-host, and contribute freely; you just can't build a competing hosted Pulse HR product during the two-year window.

## Links

- **Product:** [app.pulsehr.it](https://app.pulsehr.it)
- **Marketing:** [pulsehr.it](https://pulsehr.it)
- **Roadmap:** [pulsehr.it/roadmap](https://pulsehr.it/roadmap)
- **Feedback board:** [GitHub Discussions](https://github.com/davide97g/pulse-hr/discussions)
- **Changelog:** [pulsehr.it/changelog](https://pulsehr.it/changelog)
- **Status:** [status.pulsehr.it](https://status.pulsehr.it)
- **Contact:** [hello@pulsehr.it](mailto:hello@pulsehr.it) · security: [security@pulsehr.it](mailto:security@pulsehr.it)
