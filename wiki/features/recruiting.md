---
type: feature
tags: [feature, people]
status: parked  # 2026-05 people-first refocus — see ../AGENTS.md
last_updated: 2026-05-14
---

# Recruiting

The hiring pipeline, as a kanban board. Each card is a [[Candidate]] for a specific [[Job Posting]].

## Who uses it

[[HR]] (mostly recruiters). [[Admin]] has full visibility.

## Key entities

[[Candidate]] · [[Job Posting]] · [[Employee]] (when hired)

## Notable behaviors

- **Stages.** Applied → Screen → Interview → Offer → Hired. Drag to move stage.
- **Rating.** 1–5 stars per candidate, set during interview rounds.
- **Hire transition.** Moving a candidate to Hired triggers the [[Onboarding]] workflow — see [[Candidate to Employee]].
- Mobile view collapses the kanban into a horizontal scroll lane.

## Related journeys

[[Candidate to Employee]] · [[Onboarding a New Hire]]
