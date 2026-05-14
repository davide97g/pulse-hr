---
type: journey
aliases: [Onboarding a New Hire]
tags: [journey, people]
status: parked  # 2026-05 people-first refocus — see ../AGENTS.md
last_updated: 2026-05-14
---

> **Parked journey.** This flow centres on [[Onboarding]] workflows, [[Recruiting]], [[Documents]] e-sign, [[Allocation]] and [[Time Tracking]] — all parked in the May 2026 people-first refocus. The text below is preserved for historical reference. The much smaller post-refocus version: HR adds an employee, the employee logs into Pulse and finds their first [[Status Log]] prompt waiting; the rest of onboarding lives in the HRIS the workspace already runs.

# Onboarding a New Hire

End-to-end: from offer-signed to first-week productive.

## Steps

1. **[[HR]] moves the [[Candidate]] to Hired in [[Recruiting]].**
   The candidate record converts to an [[Employee]] record (status `active`).
2. **[[Onboarding]] auto-creates the workflow.**
   Standard [[Onboarding Task]]s are instantiated with the offer date as day zero.
3. **IT receives the laptop task.**
   Owner: IT lead. Due: -3 days. Optionally references an [[Office]] for shipping address.
4. **HR creates the contract [[Document]].**
   Templated (NDA + employment contract). New hire sees it on day one for signature. *(Bootstrap note: e-signature is currently mocked — see `log.md`.)*
5. **The new [[Employee]] gets a welcome [[Announcements|announcement]].**
   Optional auto-post; HR can suppress or customize.
6. **Manager assigns an intro buddy.**
   Buddy is added to the new hire's first-week 1:1s on the [[Calendar]].
7. **Manager sets a starter [[Allocation]] on a [[Commessa]].**
   Even a 10% shadow allocation makes [[Time Tracking]] meaningful from week one.
8. **First [[Status Log]] session opens automatically on day one.**
   The agent's first prompt is "welcome — anything you want me to flag to your manager from your first week?"
9. **[[Onboarding Task]]s tick off through the week.**
   Visible to the new hire on [[Dashboard]] and to HR on the [[Onboarding]] page.

## Personas involved

[[HR]] (drives) · [[Admin]] (configures the template) · the new [[Employee]] (consumes) · [[Manager]] (allocates and welcomes).
