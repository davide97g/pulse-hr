---
type: feature
tags: [feature, insights, people]
last_updated: 2026-05-14
---

# People Insights

The aggregate surface for **engagement, sentiment, kudos, growth, Pulse vibe over time**. Reports about how people are doing — not about cost per hire, margin, or turnover.

> The page still lives at `/reports` for now and the route file is `reports.tsx`, but the product surface is People Insights.

## Who uses it

[[HR]], [[Admin]], [[Manager]] (for their team). [[Finance]] no longer has a primary view here — that data lives in payroll/HRIS tools.

## Key entities

[[Employee]] · [[Kudo]] · [[Log Session]] · [[Pulse Entry]] · [[Employee Score]]

[[Commessa]], [[Allocation]] and [[Timesheet Entry]] are no longer surfaced here.

## Notable behaviors

- **Two tabs.** Overview · People. (The old `Time` tab is parked.)
- **KPI tiles.** Kudos volume, eNPS, Growth obiettivi, Pulse mood — replacing the old Headcount / Turnover / Absenteeism / eNPS row.
- **Date-range filter.** Last 7g / 30g / Q1 / Q2 / YTD.
- **Drill-down.** Click an aggregate to see the underlying entities (a kudos breakdown, a sentiment band, a Pulse week).
- **What it does not show.** No cost-per-hire, no turnover percentage, no margin per commessa, no time-to-hire. Those numbers belong in the tool that produces them.

## Related journeys

[[Quarterly Pulse Cycle]]
