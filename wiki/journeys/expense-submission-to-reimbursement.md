---
type: journey
aliases: [Expense Submission to Reimbursement]
tags: [journey, money]
last_updated: 2026-04-26
---

# Expense Submission to Reimbursement

End-to-end: from "I bought lunch with the client" to "money landed in my account."

## Steps

1. **[[Employee]] hits `⌘J` "submit expense" or opens [[Expenses]].**
   Drops a category, amount, currency, date, attaches a receipt.
2. **Submit.**
   Status: `pending`. Lands on the manager's queue.
3. **[[Manager]] reviews.**
   Approves up to a threshold. Above it, escalates to [[Finance]].
4. **[[Finance]] approves above-threshold expenses.**
   Status: `approved`.
5. **Finance triggers reimbursement.**
   Either rolls into the next [[Payroll Run]] (most common) or processes a separate transfer.
6. **Status: `reimbursed`.**
   Employee sees the update on [[Dashboard]].

## Edge case

Rejected expense — manager or finance can decline with a reason. Employee is notified; can edit and resubmit.

## Personas involved

[[Employee]] (drives) · [[Manager]] (first approver) · [[Finance]] (final approver and payer).
