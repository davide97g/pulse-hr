---
type: feature
tags: [feature, people, italian]
last_updated: 2026-05-14
---

# Leave

A **personal journal of the days off you took**. Not a request system. Not an approval queue. You log a day off the way you'd write it in your own calendar, and it's logged.

## Who uses it

- [[Employee]] logs their own days off, sees their own balance.
- [[Manager]] glances at the team OOO view to plan around it.
- [[HR]] doesn't have an approval role here — Pulse left that with the payroll/HRIS tool that handles it properly.

## Key entities

[[Leave Request]] · [[Employee]]

The entity is still called `Leave Request` in code for historical reasons, but in the people-first refocus there is nothing to request and nothing to approve — every entry is created in the `approved` state.

## Notable behaviors

- **One form, one click.** Type (vacation / sick / personal / parental) + from + to + optional note. That's it.
- **Auto-approved.** No pending state. No manager queue. The employee is logging a fact about their own time, not asking permission.
- **Italian variants.** Maps to [[ferie]] / [[malattia]] / [[permesso]] / [[ROL]] in IT-tagged workspaces. Still informational only.
- **Personal balance.** The remaining days/hours bar is visible only to the employee. Pulse doesn't enforce the cap — it's a number to be aware of, not a guardrail.
- **Team OOO.** The team's day-off list is visible to the team (people respect each other's plans), but the page is built around the personal journal first.
- **No payroll handoff.** Pulse never reports leave back to a payroll system. Your HRIS is still where the contractually-relevant record lives.

## Related journeys

[[Logging Time Off]]
