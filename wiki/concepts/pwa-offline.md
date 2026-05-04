---
type: concept
aliases: ["PWA & Offline"]
tags: [concept]
last_updated: 2026-04-26
---

# PWA & Offline

Pulse HR is a Progressive Web App. It installs on macOS, Windows, iOS, and Android with no app-store dance, and it stays useful when the network is gone.

## Offline-first surfaces

- [[Time Tracking]] — log hours offline; sync on reconnect.
- [[Status Log]] — draft messages offline; the agent processes once connected.
- [[Kudos]] — drafts saved offline; sent on reconnect.
- [[Dashboard]] — read-only view hydrates from the local cache.

## Online-only surfaces

- [[Payroll]] runs.
- [[Recruiting]] stage moves (touches external integrations).
- Destructive actions on shared records.
- Anything that would create a sync conflict.

## Update behavior

When a new version of the app ships, a toast appears: "New version available — reload." Users decide when to reload; nothing forces them mid-task. See also "Ready to work offline" toast on first install.
