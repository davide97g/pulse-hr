---
type: entity
tags: [entity, people]
last_updated: 2026-04-26
---

# Employee

A person on payroll. The most-referenced entity in the wiki.

## Definition

A record with a name, email, role title, [[Department]], optional manager, location, employment type (Full-time / Part-time / Contractor), join date, salary, and a couple of optional fields (birthday, phone). Italian name: *dipendente*.

## Lifecycle / states

`active` → most employees, most of the time.
`on_leave` → currently away on an approved [[Leave Request]].
`remote` → permanently distributed, no fixed [[Office]].
`offboarding` → in the process of leaving; system access being wound down.

## Connected entities

- Has many [[Timesheet Entry]]s, [[Leave Request]]s, [[Expense]]s.
- Has many [[Kudo]]s (sent and received).
- Has one or more [[Allocation]]s to [[Commessa]]e.
- Has a [[Log Session]] history (their [[Status Log]]).
- Belongs to a [[Department]] and (optionally) reports to another Employee.
- Becomes one only after a [[Candidate]] is moved to Hired in [[Recruiting]].

## Where it appears

[[Employees]] · [[Org Chart]] · [[Dashboard]] · [[Status Log]] · [[Time Tracking]] · [[Leave]] · [[Payroll]] · [[Expenses]] · [[Recruiting]] · [[Onboarding]] · [[Documents]] · [[Moments]]
