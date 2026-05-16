---
type: concept
aliases: [Role Themes, Themes]
tags: [concept, design]
last_updated: 2026-05-16
---

# Role Themes

Pulse HR ships **two** themes: light and dark. There is no per-persona accent palette. Everyone uses the same visual chrome; what differs between personas is **navigation, feature gating, and default landing screen** — not colour.

## Themes that ship

| Theme | Source | Notes |
|---|---|---|
| **light** | `packages/tokens/src/themes/light.css` | Off-white surface, lime spark accent. |
| **dark** | `packages/tokens/src/themes/dark.css` | Default — near-black surface, lime spark accent. |

[[Settings]] toggles between them. `/login`, `/signup` and the public [[Feedback]] site lock to dark.

## What changes per persona

The persona shift comes from sidebar groups and feature gates, not colour:

- **[[Employee]]** (primary) lands on [[Dashboard]]; sees [[Status Log]], [[Growth]], [[Kudos]], [[Moments]], [[Saturation]], [[Leave]], [[Pulse]].
- **[[Manager]]** (secondary) adds the team-feed and recap views in [[Status Log]], the Workload aggregate, and the team OOO view.
- **[[HR]]** (secondary) unlocks People Insights ([[Reports]]) and the cross-team [[Pulse]] heatmap.
- **[[Admin]]** (secondary) sees everything plus [[Modules]] and [[Developers]].
- **[[Finance]]** (marginal — Pulse is not built for them) has access only to People Insights aggregates and their own personal surfaces. See [[Finance]] for the honest framing.

## Where it embodies

[[Settings]] · [[Modules]] · [[Role Override]] (topbar "View as") · every screen.

## See also

- [[Target Audience]] — the primary/secondary persona hierarchy.
- [[Brand Voice]] — visual restraint as part of the voice.
