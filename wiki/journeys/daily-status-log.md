---
type: journey
aliases: [Daily Status Log]
tags: [journey, pulse]
last_updated: 2026-05-09
---

# Daily Status Log

End-to-end: how a regular workday flows through Pulse HR for an [[Employee]].

## Steps

1. **Morning — open [[Dashboard]].**
   Sees today's [[Calendar]], pending [[Manager Ask]]s, kudos overnight, [[Moments]] (someone's birthday today?).
2. **Open [[Status Log]] (`⌘J`).**
   Read the team feed first — three or four lines from each teammate. The [[Pulse]] strip at the top shows the rough team mood.
3. **Post your own status.**
   Three lines: yesterday, today, blockers. Pick a topic preset (status / win / pain / challenge / feedback) so the recap can categorise it. ⌘⏎ to publish — it joins the public feed.
4. **Mid-morning — log time against a [[Commessa]] in [[Time Tracking]].**
   The [[Timesheet Entry]] is pre-filled from calendar context.
5. **Mid-afternoon Status Log entry.**
   File a `pain` log noting a blocker. Same composer, different topic preset.
6. **Send a [[Kudo]] to a teammate who unblocked you.**
   Public, +20 coins, tagged `kindness` — see [[Growth]].
7. **End of day — log any remaining hours.**
   The [[Command Palette]] (`⌘K` "log 1.5h on ACM-2025-01") is the fastest route — its local intent parser maps the phrase to a timesheet action.
8. **Review the daily recap.**
   `/log/recap` aggregates that day's logs deterministically — count, topic mix, sentiment dimensions, drivers, suggested next moves.

## What the manager sees later

The same public feed, plus the per-employee recap (`/log/<employee-id>`) — a manager-safe summary, sentiment trend, sparkline and topic contribution. The raw chat doesn't exist (there's no chat) and the recap surfaces only the structured fields plus deterministic aggregates.

## Personas involved

[[Employee]] (drives the whole day) · [[Manager]] (reads the rollup tomorrow morning).
