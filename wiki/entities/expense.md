---
type: entity
tags: [entity, money]
last_updated: 2026-04-26
---

# Expense

A receipt-backed reimbursement request.

## Definition

An [[Employee]], a description, a category (Travel / Meals / Software / Equipment), an amount + currency, a date, an attached receipt, and a status. Italian name: *nota spese*.

## Lifecycle / states

`pending` → awaiting approval.
`approved` → cleared by manager / [[Finance]].
`reimbursed` → paid out.
`rejected` → declined.

## Connected entities

- Belongs to an [[Employee]].
- Approved by [[Manager]] (under threshold) or [[Finance]] (above).

## Where it appears

[[Expenses]] · [[Dashboard]] · [[Reports]]
