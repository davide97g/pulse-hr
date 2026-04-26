---
type: journey
aliases: [Monthly Payroll Run]
tags: [journey, money, italian]
last_updated: 2026-04-26
---

# Monthly Payroll Run

End-to-end: from cycle open to [[Payslip]]s delivered. The Italian-locale variant produces a [[busta paga]] per employee.

## Steps

1. **[[Finance]] opens a new [[Payroll Run]] for the period.**
   E.g. "April 2026." Status: `draft`.
2. **Finance reviews [[Time Tracking]] for the period.**
   Looks for unsubmitted timesheet entries, anomalies, missing approvals.
3. **Managers approve any outstanding [[Timesheet Entry|timesheet entries]].**
   Driven by a Dashboard prompt.
4. **[[HR]] confirms [[Leave Request]]s for the period are finalized.**
   Pending requests get pushed to next cycle.
5. **Finance schedules the run.**
   Status: `scheduled` → `processing` on date.
6. **The system computes [[Payslip]]s.**
   Per [[Employee]]: gross from base salary + hours, deductions, net. Italian payslips render the [[busta paga]] PDF.
7. **Finance reviews aggregate totals in [[Reports]].**
   Headcount, total gross, total net, [[Commessa]] margin impact.
8. **Run closes.**
   Status: `completed`. [[Time Tracking]] entries inside the period go read-only (lock window).
9. **Each [[Employee]] sees their [[Payslip]] on [[Dashboard]].**

## Personas involved

[[Finance]] (drives) · [[HR]] (leave finalization) · [[Manager]] (timesheet approvals) · [[Employee]] (consumes their payslip).
