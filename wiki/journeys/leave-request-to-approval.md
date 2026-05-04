---
type: journey
aliases: [Leave Request to Approval]
tags: [journey, work]
last_updated: 2026-04-26
---

# Leave Request to Approval

End-to-end: from "I want a Friday off" to "approved, see you Monday."

## Steps

1. **[[Employee]] opens [[Leave]] (or hits `⌘J` and types "request leave Friday").**
   [[Copilot]] parses the intent and pre-fills a draft [[Leave Request]].
2. **Employee picks type and granularity.**
   Vacation / Sick / Personal / Parental. Full or half day. Italian-locale workspaces label as [[ferie]] / [[malattia]] / [[permesso]] / Parental.
3. **Submit.**
   Status: `pending`. The request appears on the manager's [[Dashboard]] and [[Calendar]] (greyed-out pending slot).
4. **Manager approves or rejects.**
   Approved → status becomes `approved`. Rejected → status becomes `rejected`, with a reason the employee can read.
5. **On approval:**
   - The [[Calendar]] slot turns solid for the team to see.
   - [[Saturation]] for the period drops the employee's capacity.
   - The employee's leave balance decrements.
   - The next [[Payroll Run]] picks it up automatically.

## Personas involved

[[Employee]] (drives) · [[Manager]] (approves) · [[HR]] (escalation / override).
