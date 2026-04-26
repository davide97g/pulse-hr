---
type: entity
tags: [entity, people]
last_updated: 2026-04-26
---

# Candidate

A person being considered for a role. Lives only inside [[Recruiting]] until they're hired and converted into an [[Employee]].

## Definition

A name, a role they're applying to (linked to a [[Job Posting]]), a stage, a rating, and an applied date.

## Lifecycle / states

`Applied` → in the inbox.
`Screen` → initial recruiter call.
`Interview` → loop in progress.
`Offer` → offer extended.
`Hired` → triggers [[Onboarding]] and creates an [[Employee]] record.

## Connected entities

- Linked to a [[Job Posting]].
- Becomes an [[Employee]] on transition to Hired.
- Generates [[Onboarding Task]]s on hire.

## Where it appears

[[Recruiting]]
