---
type: concept
aliases: [Role Override, View As]
tags: [concept, workspace]
last_updated: 2026-05-09
---

# Role Override

A "View as" dropdown in the topbar that lets anyone preview the workspace as a different [[persona]] — without leaving their account or changing the saved workspace role.

## Two role layers

Pulse HR keeps three role concepts separate:

1. **Real Clerk role** — server-set, reserved for Pulse staff. Almost no UI looks at it.
2. **Workspace persona** — `admin` / `hr` / `manager` / `finance` / `employee`. Picked at [[Welcome]] and saved at `pulse.ws.<userId>.role`. Defaults to **admin** because every user owns their own demo workspace.
3. **Override** — the *temporary* persona the topbar dropdown sets. Saved at `pulse.roleOverride`. Returns to `null` when cleared.

The effective role is `override ?? persona`. Feature gates and the sidebar render against the effective role.

## What you can switch to

The override choices are **employee, hr, manager, finance** — admin is omitted because it's the home view. Coming back to admin is "Clear override".

## Why it exists

- **Demo.** A founder showing the product to a finance lead can flip into the finance persona in one click — no second account.
- **HR / Admin verification.** "Does the leave page actually look right for an employee?" answered by switching to employee for ten seconds.
- **No re-auth.** The Clerk session is unchanged — this is purely a UI flag.

## Where it embodies

[[Settings]] (theme + persona) · [[Modules]] (per-role allowlists) · the topbar avatar menu on every screen.
