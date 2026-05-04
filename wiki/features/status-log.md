---
type: feature
aliases: [Status Log]
tags: [feature, pulse, ai]
last_updated: 2026-04-26
---

# Status Log

A daily conversation between an [[Employee]] and an AI agent. Free-form: vents, wins, blockers, asks. The boundary is strict — the manager only sees the **summary** the agent produces, never the raw transcript.

## Who uses it

- [[Employee]] writes (or speaks) into the log throughout the day. It feels like chatting with a friendly intern.
- [[Manager]] and [[HR]] read the agent-generated manager summary, sentiment trend, and recap topics.

## Key entities

[[Log Session]] · [[Manager Ask]] · [[Pulse Entry]] · [[Employee Score]]

## Notable behaviors

- **Privacy boundary.** The employee sees their own raw transcript. Managers and HR see only the summary, and only the parts the agent deems manager-safe. The employee can read what the manager will see before it ships.
- **Manager Ask.** A manager can pre-load a question ("how did the ACME demo feel?") that the agent will work into the next conversation. The answer comes back as a summary.
- **Sentiment dimensions.** Energy, stress, engagement, alignment — a 0-100 score per dimension, plus an overall.
- **Voice input.** Optional. Tap-to-talk; transcribed into the log.
- **Topic tagging.** status / win / pain / challenge / feedback / freeform. Drives the recap.

## Related journeys

[[Daily Status Log]] · [[Quarterly Pulse Cycle]]
