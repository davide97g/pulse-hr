---
type: feature
tags: [feature, insights, labs, wellbeing]
last_updated: 2026-05-14
---

# Workload check-in

> The feature is still called `saturation` in code and at `/saturation` for now. The product surface and product name are **Workload check-in**.

A **one-tap weekly self check-in**: how heavy is this week? Four options — 🌤 Light, ⛅ Balanced, 🌧 Heavy, ⛈ Overloaded — and an 8-week sparkline of your own past answers. That's the whole feature.

The old allocation/timesheet-driven heatmap is parked; Pulse HR doesn't track hours.

## Who uses it

- [[Employee]] checks in for themselves every Friday (the nudge is soft).
- [[Manager]] sees a **team aggregate** only — how many people landed in each bucket, and the trend. Never individual answers.
- [[HR]] reads aggregate trends across teams as an overload signal alongside [[Pulse Entry]] and [[Status Log]] sentiment.

## Key entities

[[Employee]] · `WorkloadCheckIn` (week + level + at, stored on the employee).

Allocations, commesse and timesheet entries no longer feed this surface.

## Notable behaviors

- **Four buttons, no form.** Tap-to-log. Tap again to change. Last answer in the week wins.
- **Private by default.** The employee's own sparkline is visible only to them. The team aggregate is visible to managers.
- **External-tool nudge.** A soft footer on the page reminds the employee that hours, allocations and project tracking live in their existing tool — Pulse HR doesn't compete there.
- **Lives at `/saturation`** in the *Wellbeing* sidebar group, with `/docs/saturation` as the in-app explainer. Counts as [[Labs]] because the manager-aggregate visualisation is still maturing.
- **8-week sparkline.** Missed weeks render as dashed circles; the line skips gaps. Seven weeks of plausible history are seeded on first visit so the chart isn't empty.

## Related journeys

— (No allocation-driven journeys link here anymore. The check-in is the journey.)
