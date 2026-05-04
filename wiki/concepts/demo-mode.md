---
type: concept
aliases: [Demo Mode]
tags: [concept]
last_updated: 2026-04-26
---

# Demo Mode

The state Pulse HR runs in when no real workspace is connected. The whole app works — every screen, every CRUD action — but data is seeded from local mocks, edits live in `localStorage`, and nothing syncs to a backend (with the exception of [[Feedback]], which uses real infrastructure).

## Signaling

- A dismissible **Demo banner** sits at the top of the page on desktop and the bottom on mobile, stating that the workspace is a frontend-only mockup.
- The banner offers a path to sign in for real, or to keep exploring.

## Scope

- All sidebar features that don't require a backend work in Demo Mode.
- Destructive actions (delete with undo) work locally.
- A "reset workspace" action in [[Settings]] wipes the local store back to seeds.

## Why it exists

Letting visitors browse the product as if they were already inside is an explicit positioning choice — see [[Open Source Positioning]]. No login wall stands between curiosity and exploration.
