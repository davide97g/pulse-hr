---
type: concept
aliases: [Role Themes]
tags: [concept, design]
last_updated: 2026-04-26
---

# Role Themes

Pulse HR ships seven themes — light, dark, and one variant per role: employee, hr, manager, admin, finance. Switching role doesn't just gate features (see [[Modules]]) — it re-skins the app so the persona's daily surface feels distinct.

## Accent colors

| Role | Accent | Vibe |
|---|---|---|
| [[Employee]] | Lime `#b4ff39` | The default — fresh, focused. |
| [[HR]] | Coral `#ff8a7a` | Human, warm. |
| [[Manager]] | Amber `#ffbf4a` | Responsibility, warmth. |
| [[Admin]] | Cyan `#6fd8ff` | Systems, control. |
| [[Finance]] | Violet `#c48fff` | Fiscal calm. |

## Scope

- Theme is selected per [[Employee]] (saved in [[Settings]]).
- [[Admin]] can override their own role to **view as** another role — the UI re-skins and the sidebar filters down to that role's allowed features.
- Light vs. dark and the role variant are orthogonal; you can have "HR theme on dark surface" or "HR theme on light."

## Where it embodies

[[Settings]] · [[Modules]] (admin role override) · every screen
