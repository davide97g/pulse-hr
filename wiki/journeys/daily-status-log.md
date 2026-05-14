---
type: journey
aliases: [Daily Status Log]
tags: [journey, pulse]
last_updated: 2026-05-14
---

# Daily Status Log

End-to-end: how a regular workday flows through Pulse HR for an [[Employee]].

## Steps

1. **Morning — open [[Dashboard]].**
   Sees their status streak, kudos overnight, growth score, [[Moments]] (someone's birthday today?), team Pulse vibe.
2. **Open [[Status Log]] (`⌘J`).**
   Read the team feed first — three or four lines from each teammate. The [[Pulse]] strip at the top shows the rough team mood.
3. **Post your own status.**
   Three lines: what you did, what you're doing, what's blocking. Pick a topic preset (status / win / pain / challenge / feedback) so the recap can categorise it. ⌘⏎ to publish — it joins the public feed.
4. **Mid-afternoon Status Log entry (optional).**
   File a `pain` log noting a blocker. Same composer, different topic preset.
5. **Send a [[Kudo]] to a teammate who unblocked you.**
   Public, +20 coins, tagged `kindness` — see [[Growth]].
6. **Friday: tap the Workload check-in.**
   One of four buttons — light / balanced / heavy / overloaded. Lands on the employee's own 8-week sparkline.
7. **Review the daily recap.**
   `/log/recap` aggregates that day's logs deterministically — count, topic mix, sentiment dimensions, drivers, suggested next moves.

## What the manager sees later

The same public feed, plus the per-employee recap (`/log/<employee-id>`) — a manager-safe summary, sentiment trend, sparkline and topic contribution. The raw chat doesn't exist (there's no chat) and the recap surfaces only the structured fields plus deterministic aggregates.

## Personas involved

[[Employee]] (drives the whole day) · [[Manager]] (reads the rollup tomorrow morning).
