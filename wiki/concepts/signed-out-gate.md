---
type: concept
aliases: [Signed-Out Gate]
tags: [concept, auth]
last_updated: 2026-05-09
---

# Signed-Out Gate

The split between what an unauthenticated visitor can see and what waits behind sign-in. Pulse HR is intentionally generous with the demo — almost everything works without an account — but a small ring of routes is gated.

## Public routes

- `/welcome` — the first-run editorial (see [[Welcome]]).
- `/login`, `/signup` — Clerk-hosted forms, dark theme forced.

These three render with a bare `<Outlet />` — no sidebar, no topbar, no [[Demo Mode]] banner.

## Everything else

Wrapped by `<AppShell />` and a route guard. Visitors who hit a gated URL without a session get bounced to `/login`, but `/welcome` re-onboards them once they're back.

## Demo banner

When `[[Demo Mode]]` is active and the user is signed out, the banner offers a sign-in path so they can leave [[Feedback]] (the only feature that talks to a real backend). Signed-in users see the banner with a direct link to the public feedback board.

## Why a gate at all

The product is read-mostly without an account, but write actions that hit real infrastructure ([[Feedback]], voting, comments) need an identity attached so the maintainers can follow up. Anything frontend-only stays open.

## Where it embodies

[[Welcome]] · [[Demo Mode]] · [[Feedback]] · [[Settings]] (Reset workspace re-uses the gate).
