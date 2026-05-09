---
type: feature
tags: [feature, pulse, people]
last_updated: 2026-05-09
---

# Pulse

A team-wide vibe strip — a single row of weekly sentiment cells, by department or role — that lives **inside [[Status Log]]**. There is no standalone Pulse screen anymore; the strip surfaces the same heatmap the manager view used to dedicate a page to.

## Who uses it

- [[Employee]] glances at it before posting their own status — peer signal as social context.
- [[Manager]] and [[HR]] read the strip together with the [[Status Log]] feed and the per-employee recap. The aggregation is intentionally low-resolution so individuals can't be re-identified.

## Key entities

[[Pulse Entry]]

## Notable behaviors

- **Aggregated only.** Cells render the average of contributors in a department or team for a window; no employee-id ever attaches to a cell.
- **Threshold.** A bucket needs ≥3 respondents before it shows a value; otherwise the cell is dimmed with a "not enough signal" hint.
- **Lives inside the log.** The strip is a component (`TeamPulseStrip`), not a route. The old `/pulse` URL is not wired up.
- Counted as part of [[Labs]] because the framing — anonymous vibe heatmap distinct from the named feed — is still finding its shape.

## Related journeys

[[Daily Status Log]] · [[Quarterly Pulse Cycle]]
