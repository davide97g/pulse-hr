---
type: feature
tags: [feature, money]
last_updated: 2026-04-26
---

# Expenses

Receipts. The replacement for "email the photo to finance."

## Who uses it

- [[Employee]] submits expenses with a category, amount, currency, and date.
- [[Manager]] approves direct-report expenses up to a threshold.
- [[Finance]] approves above the threshold and marks reimbursed.

## Key entities

[[Expense]] · [[Employee]]

## Notable behaviors

- **Categories.** Travel, Meals, Software, Equipment.
- **Multi-currency.** USD, EUR, GBP at minimum.
- **Status.** pending → approved or rejected; approved → reimbursed.
- **Undo on delete.** Toast with an Undo action restores the row.

## Related journeys

[[Expense Submission to Reimbursement]]
