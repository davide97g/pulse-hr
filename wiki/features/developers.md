---
type: feature
tags: [feature, workspace]
last_updated: 2026-04-26
---

# Developers

API keys, webhooks, custom fields. The surface for power users and integrators.

## Who uses it

[[Admin]] only by default.

## Key entities

(Internal: API keys, webhooks, custom fields, audit log.)

## Notable behaviors

- **API keys.** Issue, rotate, revoke. Scoped permissions.
- **Webhooks.** Subscribe to events (employee created, leave approved, payroll completed).
- **Custom fields.** Extend [[Employee]], [[Commessa]], and a few other entities with workspace-specific fields.
- **Audit log.** Every config change is recorded with actor + timestamp.
