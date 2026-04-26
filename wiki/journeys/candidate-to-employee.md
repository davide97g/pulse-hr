---
type: journey
aliases: [Candidate to Employee]
tags: [journey, people]
last_updated: 2026-04-26
---

# Candidate to Employee

The transition. Where a [[Candidate]] in [[Recruiting]] becomes an [[Employee]] and the [[Onboarding]] machine starts.

## Steps

1. **[[HR]] drags the [[Candidate]] card from Offer to Hired.**
2. **System creates an [[Employee]] record.**
   Pre-fills name, contact info, and the role from the [[Job Posting]]. Status `active`. Manager and department default from the job posting; HR can edit.
3. **System triggers [[Onboarding]].**
   Standard [[Onboarding Task]]s instantiate with offer date as day zero — see [[Onboarding a New Hire]].
4. **Welcome [[Announcements|announcement]] (optional).**
5. **[[Org Chart]] updates.**
   New node appears under the manager.
6. **[[Recruiting]] kanban updates.**
   The card moves to the Hired column; the [[Job Posting]] status flips to filled.

## Personas involved

[[HR]] (drives) · [[Admin]] (config) · [[Manager]] (welcomes) · the new [[Employee]] (begins).
