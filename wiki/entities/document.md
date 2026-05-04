---
type: entity
tags: [entity, work]
last_updated: 2026-04-26
---

# Document

Paperwork. Contracts, NDAs, handbooks, equipment receipts. Italian name: *documento*.

## Definition

A title, a kind (contract / NDA / handbook / receipt / other), a template flag, an audience ([[Employee]] or all-staff), a signature requirement, and an audit trail.

## Lifecycle / states

`draft` → in authoring.
`active` → published to its audience.
`signed` → all required signatures collected.
`archived` → no longer current.

## Connected entities

- Belongs to one or many [[Employee]]s (audience).
- May be referenced by an [[Onboarding Task]].

## Where it appears

[[Documents]] · [[Onboarding]]
