---
type: entity
aliases: [Timesheet Entry]
tags: [entity, work]
last_updated: 2026-04-26
---

# Timesheet Entry

One row of logged time. The atomic unit of [[Time Tracking]].

## Definition

An [[Employee]], a [[Commessa]], a date, a duration in hours (often quarter-hour granularity), and an optional note. Italian name: *foglio ore* (sheet) — entries themselves are *voci*.

## Lifecycle / states

`draft` → entered but not submitted.
`submitted` → ready for manager review.
`approved` → reviewed and good.
`locked` → captured by a closed ; immutable.

## Connected entities

- Belongs to an [[Employee]] and a [[Commessa]].
- Aggregated into s by s.
- Counted against [[Saturation]] and  burn.
- Can originate from a  (one-click conversion).

## Where it appears

[[Time Tracking]] · [[Reports]]
