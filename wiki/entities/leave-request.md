---
type: entity
aliases: [Leave Request]
tags: [entity, work, italian]
last_updated: 2026-04-26
---

# Leave Request

A formal request to be away. Vacation, sick, personal, or parental.

## Definition

An [[Employee]], a type ([[ferie]] / [[malattia]] / [[permesso]] / Parental), a date range, a number of equivalent working days (half-day rows store 0.5), a reason, and a status. Italian umbrella term: *richiesta assenza*.

## Lifecycle / states

`pending` → submitted, awaiting approval.
`approved` → green-lit; flows into [[Calendar]] and [[Payslip]] calculations.
`rejected` → declined with a reason.

## Connected entities

- Belongs to an [[Employee]].
- Approved by an [[Employee]] (manager) or by [[HR]].
- Reduces capacity in [[Saturation]] and adjusts the next [[Payslip]].

## Where it appears

[[Leave]] · [[Calendar]] · [[Dashboard]] · [[Payroll]] · [[Saturation]]
