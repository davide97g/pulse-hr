---
type: entity
aliases: [Onboarding Task]
tags: [entity, people]
last_updated: 2026-04-26
---

# Onboarding Task

One step in a new hire's first weeks. The atomic unit of [[Onboarding]].

## Definition

A title, an owner (HR, IT, Finance, the manager, the new hire themselves), a due date relative to start, a status, and an optional [[Document]] attachment.

## Lifecycle / states

`pending` → not yet due.
`in_progress` → owner has started.
`done` → completed.
`overdue` → due-date passed without completion.

## Connected entities

- Belongs to an [[Employee]] (the new hire).
- Owned by an [[Employee]] (the action-taker).
- May reference a [[Document]] (e.g. NDA template).
- May reference an [[Office]] (e.g. desk assignment).

## Where it appears

[[Onboarding]] · [[Dashboard]] (the new hire sees their list)
