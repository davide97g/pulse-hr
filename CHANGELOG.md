# Changelog

All notable user-facing changes to Pulse HR. Each `## version — date — "title"` section
below becomes a release announcement. An optional fenced ` ```tour ` block embeds an in-app
tour that the "What's new" prompt can launch.

## 0.1.0 — 2026-05-14 — "People-first, fresh start"

Pulse HR resets to a people-first product. Versioning starts over at 0.1.0 across every workspace (app, api, feedback, marketing, design) so the changelog tracks the new scope from a clean baseline. Business-ops surfaces (Time Tracking, Projects, Activities, Clients, Recruiting, Documents, Offices, Announcements, Marketplace, Developers, Calendar, Onboarding workflows) are parked — their routes still compile but the sidebar no longer links to them, leaving the surface dedicated to employee satisfaction, growth, recognition, async standups and wellbeing.

- **People-first scope** — Status Log, Growth, Kudos, Moments, Workload check-in, Leave journal, Pulse, People Insights, Employees, Org chart and Dashboard are the active surfaces. Everything else is hidden behind a feature flag rather than removed, so we can bring modules back without rewrites.
- **Skills Matrix** — a new Growth surface that maps every employee against the skills the team cares about, with a heat-map view, gap analysis and per-person skill paths. Available from the Growth hub.
- **Reset versioning** — every workspace (`@workflows-people/app`, `@pulse-hr/api`, `@pulse-hr/feedback`, `pulse-hr-marketing`, `@pulse-hr/design`) ships at `0.1.0`. The "What's new" gate is rearmed for everyone — the previous dismissals were cleared along with the old release log.
- **Wiki refresh** — `/wiki` is the canonical product knowledge base. Read `wiki/AGENTS.md` and the personas / features / journeys pages instead of re-deriving the product model from routes.
