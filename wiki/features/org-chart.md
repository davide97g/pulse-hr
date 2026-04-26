---
type: feature
aliases: [Org Chart]
tags: [feature, people]
last_updated: 2026-04-26
---

# Org Chart

A visual tree of who reports to whom. Built from the `manager` field on each [[Employee]] record.

## Who uses it

- [[Employee]] uses it to understand the company shape, especially after onboarding.
- [[Manager]] uses it for skip-level visibility.
- [[HR]] uses it to spot gaps and broken chains (managers who don't appear as anyone's manager, employees with no manager set).

## Key entities

[[Employee]] · [[Department]]

## Notable behaviors

- Click a node → opens the person's profile.
- Online / offline / focus indicators surface from [[Focus Mode]] and [[Status Log]] presence.
- Org chart filters by [[Department]].

## Related journeys

[[Onboarding a New Hire]]
