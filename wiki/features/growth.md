---
type: feature
tags: [feature, pulse, people]
last_updated: 2026-04-26
---

# Growth

Engagement, performance, and trajectory at the [[Employee]] level. The companion to traditional performance reviews — but built from continuous signal, not once-a-year surveys.

## Who uses it

[[HR]] runs growth cycles. [[Manager]] reads team rollups. [[Employee]] sees their own score and trends.

## Key entities

[[Employee Score]] · [[Log Session]] · [[Pulse Entry]] · [[Kudo]]

## Notable behaviors

- **Score = 0..100.** Composed from [[Status Log]] sentiment, [[Pulse]] entries, [[Kudo]] velocity, and manager-marked highlights. Trend (up / flat / down) is shown as a sparkline.
- **Manager-safe view.** Like [[Status Log]], the underlying raw signal stays private — only aggregates and topic tags cross the boundary.
- **Quarterly cycle.** Optional structured review window: HR opens the cycle, managers fill in qualitative signal, the agent assembles a draft talk-track for the 1:1.
- **Engagement signals layered on top.** [[Kudo]]s, **Achievements** (per-event medals across craft / leadership / impact / longevity / culture, tiered bronze→platinum), and **Challenges** (XP-bearing tasks at individual / squad / company scope) feed the score continuously — they're inputs, not replacements. The score + quarterly cycle remain the substrate.
- **Tabbed module.** `/growth` is a single page with five tabs — Overview (Growth River chart + KPI band + top movers + insights), Achievements wall, Challenges board (open / in-progress / completed), Kudos wall, Skill paths (per-employee level/competency/objectives view). Deep-link via `?tab=…` and `?employee=…`.
- **Kudos lives here.** The standalone `/kudos` route redirects to `/growth?tab=kudos`. Kudos is no longer a separate sidebar entry.

## Related journeys

[[Quarterly Pulse Cycle]] · [[Daily Status Log]]
