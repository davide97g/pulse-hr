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

Known gaps flagged for future research: (a) e-signature flow on `[[Documents]]` is mentioned in marketing but not visibly modeled; (b) BambooHR/Personio/Rippling importers mentioned in FAQ but no UI scaffold; (c) `[[Saturation]]` and `[[Forecast]]` overlap — relationship needs sharpening once the products mature.
