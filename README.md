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

See [`CLAUDE.md`](./CLAUDE.md) for a deeper architecture tour (routing, theme system, domain model, Labs conventions).

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

Contributions are welcome — this project lives and breathes in the open.

1. **Find something to work on**
   - [Open issues](https://github.com/davide97g/pulse-hr/issues) — bugs and small tasks
   - [GitHub Discussions](https://github.com/davide97g/pulse-hr/discussions) — feature proposals, questions, and the public **feedback board**
   - [Public roadmap](https://pulsehr.it/roadmap) — what's shipping now / next / later
2. **Open a discussion first** for anything larger than a bugfix or cosmetic change, so we can align on direction before you invest time.
3. **Fork & branch** — branch naming is loose, prefer `feat/…`, `fix/…`, `docs/…`.
4. **Match the house style** — short imperative commit subjects; body explains *why*. Conventional Commits are welcome but not enforced. Run `bun run format` and `bun run lint` before pushing.
5. **Open a PR** against `main`. Link the issue/discussion. Include screenshots or a short screen-recording for UI changes.

### Reporting bugs

Open a [GitHub issue](https://github.com/davide97g/pulse-hr/issues/new) with:

- What you did, what you expected, what happened
- Browser / OS / Bun version
- A minimal reproduction if possible

### Security

Please **do not** file public issues for security vulnerabilities. Email [security@pulsehr.it](mailto:security@pulsehr.it) and we'll coordinate a fix + disclosure.

### Code of conduct

Be kind, be direct, assume good faith. Harassment of any kind gets you removed.

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
