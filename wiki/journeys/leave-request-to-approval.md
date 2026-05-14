---
type: journey
aliases: [Leave Request to Approval, Logging Time Off]
tags: [journey, people]
last_updated: 2026-05-14
---

# Logging Time Off

End-to-end: from "I took Friday off" to "logged."

> **What changed in 2026-05.** This journey used to be `Leave Request to Approval` — an employee filed a request and a manager approved or rejected it. In the people-first refocus, the approval workflow was dropped. The employee logs the fact, and that's the journey.

## Steps

1. **[[Employee]] opens [[Leave]] (or hits `⌘K` and types "log a day off Friday").**
   The [[Command Palette]]'s local intent parser fills a draft entry.
2. **Employee picks type, dates, optional note.**
   Vacation / Sick / Personal / Parental. Full or half day. Italian-locale workspaces label as [[ferie]] / [[malattia]] / [[permesso]] / Parental.
3. **Save.**
   Status: `approved`, immediately. The entry appears in the employee's personal journal and in the team OOO view of the [[Calendar]].
4. **The employee's leave balance updates.**
   Visible on [[Dashboard]] and [[Leave]]. The balance is a number to be aware of, not a guardrail — Pulse doesn't enforce a cap.
5. **The team sees them out.**
   The [[Calendar]] OOO view shows the dates so colleagues can plan around them.

## What Pulse does NOT do

- No `pending` state. No notification to the manager.
- No `rejected` state.
- No payroll handoff. The contractually-relevant record lives in the HRIS that handles payroll.

## Personas involved

[[Employee]] (drives the whole thing). The [[Manager]] passively sees the OOO entry but has nothing to action.
