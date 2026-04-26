---
type: entity
tags: [entity, money, italian]
last_updated: 2026-04-26
---

# Payslip

The per-employee output of a [[Payroll Run]]. Italian variant is the [[busta paga]].

## Definition

A monthly statement attached to one [[Employee]] inside one [[Payroll Run]]: gross, deductions, net, period, plus the inputs (hours from [[Time Tracking]], [[Leave Request]] absences, base salary).

## Connected entities

- Belongs to a [[Payroll Run]].
- Belongs to an [[Employee]].
- Computed from [[Timesheet Entry]]s and [[Leave Request]]s in the run's period.

## Where it appears

[[Payroll]] · [[Dashboard]] (the employee sees their own)
