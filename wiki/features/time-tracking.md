---
type: feature
aliases: [Time Tracking]
tags: [feature, work]
last_updated: 2026-04-26
---

# Time Tracking

Where hours get logged against a [[Commessa]]. The single source of truth that feeds and client invoicing.

## Who uses it

- [[Employee]] logs their own hours.
- [[Manager]] reviews team timesheets, especially before approving billable hours.
- [[Finance]] reconciles against s and client invoices.

## Key entities

[[Timesheet Entry]] · [[Commessa]] · [[Leave Request]]

## Notable behaviors

- **Day view + week view.** Drag time blocks onto [[Commessa]]e. Half-day [[permesso]] entries flow through here too.
- **[[Copilot]] hooks.** "log 4h on ACM-2025-01" parsed in one keystroke.
-  
- **Offline.** Edits made offline sync when reconnected — see [[PWA & Offline]].
- **Lock window.** Once a  run is closed for the period, entries within that window go read-only.

## Related journeys

[[Daily Status Log]]
