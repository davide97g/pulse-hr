---
type: feature
tags: [feature, workspace]
last_updated: 2026-04-26
---

# Modules

[[Admin]]-only configuration page. Toggle which features each role can see.

## Who uses it

[[Admin]] exclusively.

## Notable behaviors

- Per-role allowlist of feature ids. The defaults match what is described in each persona page ([[Employee]], [[HR]], [[Manager]], [[Finance]]); admins can grant or revoke any feature for any non-admin role.
- Disabled features disappear from the role's sidebar entirely; users can't navigate to a disabled route.
- Useful when the workspace doesn't use [[Recruiting]] (no hiring), or doesn't run [[Payroll]] in-app, or wants to hide [[Labs]] features.
