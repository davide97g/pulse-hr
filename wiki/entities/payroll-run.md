---
type: entity
aliases: [Payroll Run]
tags: [entity, money]
last_updated: 2026-04-26
---

# Payroll Run

A single execution of the monthly payroll cycle. Generates one [[Payslip]] per [[Employee]] in scope.

## Definition

A period (e.g. "April 2026"), a status, an employee count, total gross, total net, and a target date.

## Lifecycle / states

`draft` → in setup.
`scheduled` → ready to fire on a date.
`processing` → currently computing.
`completed` → done, payslips finalized, time entries locked.

## Connected entities

- Has many [[Payslip]]s.
- Reads from [[Timesheet Entry]]s and [[Leave Request]]s for the period.
- Writes lock state back to [[Time Tracking]].

## Where it appears

[[Payroll]] · [[Reports]]
