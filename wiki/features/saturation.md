---
type: feature
tags: [feature, insights, labs]
last_updated: 2026-05-09
---

# Saturation

A heatmap of how loaded each [[Employee]] is. Built from [[allocation]]s, [[timesheet]] burn, and [[Leave Request]] absences. The "are we crushing this person?" view.

## Who uses it

[[Manager]] (team), [[HR]] (org), [[Finance]] (margin angle), [[Admin]].

## Key entities

[[Allocation]] · [[Employee]] · [[Commessa]] · [[Leave Request]]

## Notable behaviors

- **Per-person.** Bands: under-utilized, healthy, hot, burning. Color-coded.
- **At-risk projects.** [[Commessa]]e where the lead is in the burning band trigger a flag.
- **Look-ahead.** Saturation projects forward 4 weeks based on current allocations + scheduled [[Leave Request]]s.
- **Lives at `/saturation`** in the *Other* sidebar group, with `/docs/saturation` as the in-app explainer. Counted as part of [[Labs]] because the look-ahead projection layer is still maturing.

## Related journeys

[[Onboarding a New Hire]] (allocation triggers a saturation update).
