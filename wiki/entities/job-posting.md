---
type: entity
aliases: [Job Posting]
tags: [entity, people]
last_updated: 2026-04-26
---

# Job Posting

An open role. The container for the [[Candidate]] pipeline.

## Definition

A title, a [[Department]], a location (or "remote"), a description, an employment type, and a status (open / paused / filled / closed).

## Connected entities

- Has many [[Candidate]]s.
- On fill, links to the resulting [[Employee]] record.
- Optionally pre-configures [[Onboarding Task]]s for whoever wins it.

## Where it appears

[[Recruiting]]
