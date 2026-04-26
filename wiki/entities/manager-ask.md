---
type: entity
aliases: [Manager Ask]
tags: [entity, pulse]
last_updated: 2026-04-26
---

# Manager Ask

A pre-loaded question from a [[Manager]] to one of their direct [[Employee]] reports, surfaced inside [[Status Log]].

## Definition

A manager id, an employee id, a topic ("Feedback on the ACME demo"), a prompt the agent will work into the next conversation, an optional due date, an optional tone (neutral / empathetic / probing), and a status.

## Lifecycle / states

`pending` → not yet asked or answered.
`answered` → the agent extracted an answer summary.
`expired` → due date passed without an answer.
`snoozed` → manager pushed it out.

## Connected entities

- Belongs to one [[Manager]] and one [[Employee]].
- Lives inside [[Status Log]]; only the **answer summary** crosses the privacy boundary back to the manager.

## Where it appears

[[Status Log]] · [[Dashboard]] (manager sees pending count)
