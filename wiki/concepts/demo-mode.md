---
type: concept
aliases: [Demo Mode]
tags: [concept]
last_updated: 2026-05-09
---

# Demo Mode

The state Pulse HR runs in when no real workspace is connected. The whole app works — every screen, every CRUD action — but data is seeded from local mocks, edits live in `localStorage`, and nothing syncs to a backend (with the exception of [[Feedback]], which uses real infrastructure).

The default theme during demo is dark; sidebar collapse, theme and any active [[Role Override]] are persisted across reloads so the workspace feels owned, not transient.

## Signaling

- A dismissible **Demo banner** sits at the top of the page on desktop and the bottom on mobile, stating that the workspace is a frontend-only mockup.
- The banner offers a path to sign in (so [[Feedback]] becomes write-enabled) or to keep exploring. See [[Signed-Out Gate]] for the public/auth split.

## Scope

- All sidebar features that don't require a backend work in Demo Mode.
- Destructive actions (delete with undo) work locally.
- **Reset workspace** in [[Settings]] wipes the local store back to seeds and sends the user back to [[Welcome]] to repopulate.

## Why it exists

Letting visitors browse the product as if they were already inside is an explicit positioning choice — see [[Open Source Positioning]]. No login wall stands between curiosity and exploration.
