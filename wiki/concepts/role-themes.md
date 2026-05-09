---
type: concept
aliases: [Role Themes, Themes]
tags: [concept, design]
last_updated: 2026-05-09
---

# Role Themes

Pulse HR ships **two** themes today: light and dark. The five-persona accent palette that earlier marketing and wiki pages described (a unique colour per role) is currently aspirational — only the persona-level *navigation*, *feature gating* and *default landing screen* differ between roles. Visual chrome stays the same.

## Themes that ship

| Theme | Source | Notes |
|---|---|---|
| **light** | `packages/tokens/src/themes/light.css` | Off-white surface, lime spark accent. |
| **dark** | `packages/tokens/src/themes/dark.css` | Default — near-black surface, lime spark accent. |

[[Settings]] toggles between them. `/login`, `/signup` and the public [[Feedback]] site lock to dark.

## What changes per persona

Even without a per-role palette, the persona shift is real:

- **[[Employee]]** lands on [[Dashboard]]; sees [[Status Log]], [[Time Tracking]], [[Leave]], [[Kudos]] (under [[Growth]]).
- **[[Manager]]** adds [[Saturation]] and [[Org Chart]]; sees the team-feed and recap views in [[Status Log]].
- **[[HR]]** unlocks [[Recruiting]], [[Announcements]], [[Documents]] templates and [[Onboarding]] workflows.
- **[[Admin]]** sees everything plus [[Modules]] and [[Developers]].
- **[[Finance]]** focuses on [[Reports]] and [[Clients]].

## Where it embodies

[[Settings]] · [[Modules]] · [[Role Override]] (topbar "View as") · every screen.
