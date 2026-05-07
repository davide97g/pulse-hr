---
type: journey
aliases: [Daily Status Log]
tags: [journey, pulse]
last_updated: 2026-04-26
---

# Daily Status Log

End-to-end: how a regular workday flows through Pulse HR for an [[Employee]].

## Steps

1. **Morning — open [[Dashboard]].**
   Sees today's [[Calendar]], pending [[Manager Ask]]s, kudos overnight, [[Moments]] (someone's birthday today?).
2. **Open [[Status Log]] (`⌘J`).**
   Pick a topic room — `status`, `win`, `pain`, `challenge`, or `feedback` — and fill in the structured form.
3. **Mid-morning — log time against a [[Commessa]] in [[Time Tracking]].**
   The [[Timesheet Entry]] is pre-filled from calendar context.
4. **Mid-afternoon Status Log entry.**
   File a `pain` log noting a blocker. The form captures the pain, impact and help needed; sentiment is picked manually.
5. **Send a [[Kudo]] to a teammate who unblocked you.**
   Public, +20 coins, tagged `kindness`.
6. **End of day — log any remaining hours.**
   The [[Command Palette]] (`⌘K` "log 1.5h on ACM-2025-01") is the fastest route — its local intent parser maps the phrase to a timesheet action.
7. **Review the daily recap.**
   The recap card aggregates that day's logs deterministically — count, topic mix, sentiment trend.

## What the manager sees later

A topic-and-sentiment rollup of the employee's logs, plus kudos count. Just the structured fields the employee filled in — no LLM-generated paraphrase.

## Personas involved

[[Employee]] (drives the whole day) · [[Manager]] (reads the rollup tomorrow morning).
