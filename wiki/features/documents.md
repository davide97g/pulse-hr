---
type: feature
tags: [feature, work]
last_updated: 2026-04-26
---

# Documents

Contracts, NDAs, handbooks, and other paperwork that needs to be filed and (often) signed. The replacement for "the HR drive nobody can find."

## Who uses it

- [[HR]] uploads templates and tracks signature status.
- [[Employee]] sees documents addressed to them — read-only or signature-required.
- [[Admin]] manages workspace-wide templates.

## Key entities

[[Document]] · [[Employee]] · [[Onboarding Task]]

## Notable behaviors

- **E-signature.** Marketing claims this; the wiki flags it as a known gap (mock implementation only at bootstrap — see `log.md`).
- **Templated.** New-hire NDA, handbook acknowledgement, equipment receipt — all templates that auto-instantiate via [[Onboarding]].
- **Audit trail.** Every signature has a timestamp + IP + actor.

## Related journeys

[[Onboarding a New Hire]]
