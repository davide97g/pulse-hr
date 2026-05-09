# Wiki log

Append-only chronological record. Newest entries at the bottom.

Prefix convention: `## [YYYY-MM-DD] <op> | <subject>` where `<op>` is one of `bootstrap`, `ingest`, `lint`, `query`, `manual`.

Quick recent activity:

```
grep "^## \[" wiki/log.md | tail -10
```

---

## [2026-04-26] bootstrap | initial wiki scaffold

Created the full first-pass wiki: 5 personas, ~28 features, ~17 entities, 7 concepts, 7 journeys, 8 glossary entries. Schema (`AGENTS.md`), index (`index.md`), and human entry point (`README.md`) seeded. Pointer added to root `CLAUDE.md` so future Claude Code sessions know the wiki exists.

Source layer at bootstrap: `CLAUDE.md`, `apps/app/src/routes/`, `apps/app/src/lib/mock-data.ts`, `apps/app/src/lib/sidebar-nav-groups.tsx`, `apps/app/src/lib/role-features.ts`, `apps/marketing/src/data/landing.ts`, `packages/tokens/src/themes/`. Italian glossary terms (commessa, permesso, ferie, busta paga, TFR, ROL, malattia, badge) bootstrapped from CLAUDE.md and mock-data labels.

Known gaps flagged for future research: (a) e-signature flow on `[[Documents]]` is mentioned in marketing but not visibly modeled; (b) BambooHR/Personio/Rippling importers mentioned in FAQ but no UI scaffold; (c) `[[Saturation]]` and `` overlap — relationship needs sharpening once the products mature.

## [2026-05-09] ingest | apps/app sync — welcome, role override, sidebar, themes

Sync pass against the current state of `apps/app/`. Driven by recent commits `7b2d6bd` (welcome route + signed-out gate), `9b6ad75` (role-as override), `f9162e1` / `f34262f` (workspace simplification — name + size only), `45b7480` (sidebar regrouping), `07b5a5c` (localStorage persistence), `7d86bd5` / `87fa66a` (forced dark on auth + feedback) and the editorial rewrite of [[Status Log]] / [[Growth]] / [[Kudos]].

**Updated.** `features/status-log.md` (now an async-standup feed plus a privacy-bounded recap; explicitly no AI / no chat), `features/pulse.md` (no standalone route — the strip lives inside Status Log), `concepts/role-themes.md` (only `light` and `dark` actually ship; the five-role palette was aspirational), `personas/employee.md` (theme + status-log lines corrected), `journeys/daily-status-log.md` (steps now match the public-feed + recap surface), `concepts/labs.md` (Labs isn't a sidebar group; current inventory is Status Log / Pulse / Kudos / Saturation / Moments), `concepts/demo-mode.md` (added persistence + reset → Welcome), `features/saturation.md` (Other group, `/docs/saturation` explainer), `features/kudos.md` and `features/growth.md` (timestamp refresh).

**Created.** `features/welcome.md`, `concepts/signed-out-gate.md`, `concepts/role-override.md`, `glossary/kudos.md`, `glossary/timesheet.md`, `glossary/allocation.md`, `glossary/persona.md`. All linked from `index.md`.

**Source corrections.** Root `CLAUDE.md` had drifted on three points and was updated alongside the wiki: sidebar groups are `Dashboard / People / Time / Work / Other / Workspace` (not Overview / Money / Insights / Labs / Workspace); only two themes ship today (not seven); the public route prefix list is `/welcome /login /signup` (not `/landing /login /signup`).

Known gaps still flagged: (a) per-persona accent palettes are described in marketing but not in tokens — gap noted in `concepts/role-themes.md`; (b) [[Pulse]] sits between feature and component — page kept, with the framing "lives inside Status Log".
