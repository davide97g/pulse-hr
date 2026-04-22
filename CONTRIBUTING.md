# Contributing to Pulse HR

Thanks for taking the time to contribute. This document covers the workflow so you can ship changes quickly.

## Before you start

- **Small fix?** Open a PR directly.
- **Anything larger** — new feature, refactor, new dependency, new package in the monorepo — open a [Discussion](https://github.com/davide97g/pulse-hr/discussions) first so we can align on direction.
- **Found a bug?** Open an [issue](https://github.com/davide97g/pulse-hr/issues/new/choose) using the bug template.
- **Security issue?** Do **not** open an issue. See [`SECURITY.md`](./SECURITY.md).

## Development setup

See [`README.md`](./README.md#quick-setup) for the one-command install (`bun install`) and the dev scripts. Also skim [`docs/development.md`](./docs/development.md) for first-run troubleshooting and seed data notes.

Prereqs: **Bun ≥ 1.3**. No Node required.

## Branching & commits

- Branch from `main`. Suggested prefixes: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`.
- Short imperative commit subjects (≤ 72 chars). Body explains the **why**, not the what.
- [Conventional Commits](https://www.conventionalcommits.org/) are welcome but not enforced.
- Rebase over merge when syncing with `main`. Squash-merge is the default on PRs.

## Before you open a PR

Run locally from the repo root:

```bash
bun run format   # prettier
bun run lint     # eslint (app)
bun run build    # make sure the app + api still build
```

If you touched the marketing site: `bun run build:marketing`.

## PR checklist

- [ ] Linked issue or discussion
- [ ] `bun run lint` passes
- [ ] `bun run build` passes
- [ ] Screenshots / screen-recording for UI changes
- [ ] Docs updated (`README.md`, `docs/*`, inline comments where the _why_ is non-obvious)
- [ ] No secrets, `.env`, or generated files committed

## Code style

- TypeScript strict. Prefer narrow, domain-shaped types over `any`.
- Follow [`CLAUDE.md`](./CLAUDE.md) for architecture conventions (routing, theme tokens, CRUD pattern, toasts, responsive rules).
- Do not re-skin `src/components/ui/*` — theme via tokens in `styles.css`.
- Keep comments sparse; explain non-obvious _why_.

## License of contributions

By submitting a contribution you agree it is licensed under the repo's [FSL-1.1-MIT license](./LICENSE). No CLA required.

## Code of conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By participating you agree to uphold it.
