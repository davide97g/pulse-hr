---
type: feature
tags: [feature, money, italian]
last_updated: 2026-04-26
---

# Payroll

The monthly cycle that turns [[Time Tracking]] + [[Leave Request]]s + base salary into a [[Payslip]] per [[Employee]]. Italian payroll surface produces a [[busta paga]].

## Who uses it

[[Finance]] runs it. [[Admin]] has visibility. Other roles see only their own [[Payslip]].

## Key entities

[[Payroll Run]] · [[Payslip]] · [[Employee]] · [[Timesheet Entry]] · [[Leave Request]]

## Notable behaviors

- **States.** scheduled → processing → completed; or stuck as draft.
- **Inputs.** Hours from [[Time Tracking]], absences from [[Leave]], base salary from [[Employee]] record.
- **Outputs.** A [[Payslip]] per employee plus a [[busta paga]] PDF for IT-localized workspaces.
- **Lock window.** When a run completes, [[Time Tracking]] entries inside the period are locked.
- **Export.** CSV plus the IT XML formats (UniEmens-style — flagged as planned, not bootstrap-complete).

## Related journeys

[[Monthly Payroll Run]]
