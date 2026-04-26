---
type: entity
aliases: [Focus Session]
tags: [entity, pulse]
last_updated: 2026-04-26
---

# Focus Session

A timed deep-work block. The atomic unit of [[Focus Mode]].

## Definition

An [[Employee]], a [[Commessa]] (optional but encouraged), a started-at and ended-at, a planned duration, an actual duration, and a flag indicating whether it was logged to [[Time Tracking]].

## Lifecycle / states

`active` → timer running, status broadcast on.
`paused` → user paused the timer.
`completed` → ended cleanly.
`abandoned` → ended early without logging.

## Connected entities

- Belongs to an [[Employee]].
- Optionally references a [[Commessa]].
- Optionally produces a [[Timesheet Entry]] on completion.

## Where it appears

[[Focus Mode]] · [[Time Tracking]] · [[Org Chart]] (do-not-disturb badge)
