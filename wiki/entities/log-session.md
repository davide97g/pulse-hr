---
type: entity
aliases: [Log Session]
tags: [entity, pulse]
last_updated: 2026-04-26
---

# Log Session

One conversation between an [[Employee]] and the AI agent. The unit of [[Status Log]].

## Definition

An [[Employee]], a started-at timestamp, an ended-at (undefined while active), a topic mix (status / win / pain / challenge / feedback / freeform), a health delta (-10..+10), an employee-visible summary, and a manager-safe redacted summary.

## Lifecycle / states

`active` → currently open.
`closed` → ended; summaries finalized.

## Connected entities

- Belongs to an [[Employee]].
- Has many log messages (the actual back-and-forth).
- May contain answers to a [[Manager Ask]].
- Feeds the [[Employee Score]] in [[Growth]].

## Where it appears

[[Status Log]] · [[Growth]]
