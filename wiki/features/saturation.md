---
type: feature
tags: [feature, insights, labs]
last_updated: 2026-04-26
---

# Saturation

A heatmap of how loaded each [[Employee]] is. Built from [[Allocation]]s, [[Timesheet Entry]] burn, and [[Leave Request]] absences. The "are we crushing this person?" view.

## Who uses it

[[Manager]] (team), [[HR]] (org), [[Finance]] (margin angle), [[Admin]].

## Key entities

[[Allocation]] · [[Employee]] · [[Commessa]] · [[Leave Request]]

## Notable behaviors

- **Per-person.** Bands: under-utilized, healthy, hot, burning. Color-coded.
- **At-risk projects.** [[Commessa]]e where the lead is in the burning band trigger a flag.
- **Look-ahead.** Saturation projects forward 4 weeks based on current allocations + scheduled [[Leave Request]]s.
- Dual-listed in the wiki — appears as both an Insights surface and a [[Labs]] feature in the product. The Labs framing is the experimental forecasting layer; the Insights framing is the current-week heatmap.

## Related journeys

[[Onboarding a New Hire]] (allocation triggers a saturation update).
