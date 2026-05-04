---
type: entity
aliases: [Employee Score]
tags: [entity, pulse]
last_updated: 2026-04-26
---

# Employee Score

A 0..100 health and engagement number per [[Employee]]. Computed continuously, not annually.

## Definition

A score 0..100, a trend (up / flat / down), a sparkline of the last 14 days, four dimension sub-scores (energy, stress, engagement, alignment), an overall summary text (1-2 sentences, manager-safe), and a count of open [[Manager Ask]]s.

## Connected entities

- Computed from [[Log Session]] sentiment, [[Pulse Entry]] aggregates (anonymous, never tied back), [[Kudo]] velocity, and explicit manager signals.
- Surfaced in [[Growth]] cycles.

## Where it appears

[[Growth]] · [[Status Log]] · [[Dashboard]] (own)
