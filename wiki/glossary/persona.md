---
type: glossary
tags: [glossary, workspace]
last_updated: 2026-05-09
---

# persona

**English term.** Italian usage is the same word.

## English

The role a user plays inside a Pulse HR workspace — `admin`, `hr`, `manager`, `finance` or `employee` — separate from their real account-level role.

## Context

Pulse HR keeps two role layers deliberately apart. The **real role** comes from Clerk (server-set, almost always "user"). The **persona** is a workspace-local flag the user picks at [[Welcome]], stored under `pulse.ws.<userId>.role`. The persona drives the sidebar groups, feature visibility (see [[Modules]]) and the default landing screen.

Anyone can preview the app as another persona via the topbar — see [[Role Override]]. Switching personas is a UI shift, not a re-authentication.

See: [[Employee]], [[HR]], [[Manager]], [[Admin]], [[Finance]], [[Welcome]], [[Role Override]].
