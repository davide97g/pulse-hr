---
type: feature
tags: [feature, people]
last_updated: 2026-04-26
---

# Employees

The directory. Every person on payroll, with their profile, manager, department, location, and employment type.

## Who uses it

- [[Employee]] browses to find a colleague (search by name, role, department, location).
- [[HR]] adds new hires, edits roles, marks departures.
- [[Manager]] sees their direct reports rollup with [[Status Log]] and [[Saturation]] hooks.
- [[Admin]] has full edit rights including salary and [[Payroll]]-relevant fields.

## Key entities

[[Employee]] · [[Department]]

## Notable behaviors

- Lifecycle is reflected in `status`: active / on_leave / remote / offboarding.
- Profile page links into [[Status Log]], [[Time Tracking]], [[Leave]], [[Document]]s, and [[Kudo]]s for that person.
- Birthdays surface in [[Moments]] when the date matches.

## Related journeys

[[Onboarding a New Hire]] · [[Candidate to Employee]]
