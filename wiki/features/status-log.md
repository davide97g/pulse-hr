---
type: feature
aliases: [Status Log]
tags: [feature, pulse, people]
last_updated: 2026-05-09
---

# Status Log

The async morning standup, in writing. Each [[Employee]] posts a few lines about what they did yesterday, what they're doing today, and what's blocking them. Posts land on a public team feed. There is no call, no agent, no streaming chat — three lines per person, then back to work.

## Who uses it

- [[Employee]] writes their own status. Topic presets (status / win / pain / challenge / feedback) help them frame the entry; the **chat / chat-style** flow is gone.
- [[Manager]] and [[HR]] read the team feed for daily signal, and open the recap (`/log/recap` or `/log/<employee-id>`) for the privacy-bounded version.

## Surfaces

- **Today's feed** (`/log`) — public list of today's posts, hero card on the latest, ⌘⏎ to publish your own.
- **Per-employee recap** (`/log/<id>`) — sentiment dimensions (Energy, Engagement, Alignment, Stress), 14-day sparkline, topic contribution, drivers, and "Suggested next moves" — manager-safe summary on top.
- **My recap** (`/log/recap`) — the same view, but for yourself, plus a team scan if you have reports.

## Key entities

[[Log Session]] · [[Manager Ask]] · [[Employee Score]]

## Notable behaviors

- **Public by default, private on the recap.** The feed is for the team; the *recap* layer is what the manager sees of an individual's signal — never the raw text.
- **[[Manager Ask]].** A manager can pre-load a question; the employee sees it as a pinned prompt next time they post.
- **Sentiment is computed, not asked.** Energy / Engagement / Alignment / Stress are derived deterministically from topic mix and presets, not solicited. Confidence < 70% is shown so low-signal recaps read as prompts, not conclusions.
- **Topic presets.** status / win / pain / challenge / feedback. Drives the recap's topic contribution chart.
- **No AI in the loop.** Drafting, summarising and recaps are all deterministic. The "manager summary" is assembled from structured fields, not paraphrased by a model.
- **⌘J** opens the log from anywhere — see [[Keyboard-First]].

## Related journeys

[[Daily Status Log]]
