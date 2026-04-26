---
type: feature
tags: [feature, work, italian]
last_updated: 2026-04-26
---

# Leave

Vacation, sick days, personal time, and parental leave. The Italian-flavored variants — [[ferie]], [[permesso]], [[malattia]], [[ROL]] — flow through here too.

## Who uses it

- [[Employee]] requests leave; sees their balance.
- [[Manager]] approves / rejects requests for their reports.
- [[HR]] has org-wide visibility and override authority.
- [[Finance]] cares about the impact on [[Payslip]] calculations.

## Key entities

[[Leave Request]] · [[Employee]]

## Notable behaviors

- **Granularity.** Full day or half day (AM / PM) — half-day rows store 0.5 days.
- **Types.** Vacation, Sick, Personal, Parental. Maps to Italian [[ferie]] / [[malattia]] / [[permesso]] / [[ROL]] in IT-tagged workspaces.
- **Status.** pending → approved or rejected. Undo-able delete via [[Demo Mode]] or live workspace.
- **Calendar push.** Approved leave appears in [[Calendar]] and reduces capacity in [[Saturation]].

## Related journeys

[[Leave Request to Approval]]
