---
type: entity
tags: [entity, italian, work]
last_updated: 2026-04-26
---

# Commessa

The pivot entity. Italian for "project code" — see [[commessa|glossary/commessa.md]] for the linguistic gloss.

## Definition

A billable project line item. A commessa has a code (e.g. `ACM-2025-01`), a name, a [[Client]], an owner, a budget in hours, the burned hours so far, a status, a default billable rate, and tags. [[Time Tracking]], [[Forecast]], and [[Saturation]] all aggregate around the commessa.

## Lifecycle / states

`pitching` → in pre-sales.
`active` → live, accepting hours.
`paused` → temporarily off; hours can't be logged.
`closed` → done, locked, archived.

## Connected entities

- Belongs to a [[Client]].
- Has one or more [[Allocation]]s (people assigned, with a role and a percentage).
- Receives [[Timesheet Entry]]s logged against it.
- Surfaces in [[Forecast]] (projection) and [[Saturation]] (capacity).
- Linked to [[Activity]] items and to [[Plan]]s.

## Where it appears

[[Time Tracking]] · [[Clients]] · [[Projects]] · [[Forecast]] · [[Saturation]] · [[Reports]] · [[Activities]] · [[Focus Mode]]
