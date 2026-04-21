# Changelog

All notable user-facing changes to Pulse HR. Each `## version — date — "title"` section
below becomes a release announcement. An optional fenced ` ```tour ` block embeds an in-app
tour that the "What's new" prompt can launch.

## 0.2.0 — 2026-04-21 — "In-app + email notifications"

The bell is real. New events (comments, replies, votes, status changes, @mentions) now create
persisted notifications, and releases announce themselves by email and in-app.

- Persistent notifications with unread badge in the topbar bell
- Outbox-backed email delivery (Resend) with daily rate-limit guard
- `@name` mentions in replies notify the tagged admin (in-app + email)
- Per-channel email preferences in **Settings → Notifications**
- Changelog app-tour launches automatically on new releases

```tour
{
  "id": "release-0.2.0",
  "name": "What's new in 0.2.0",
  "workflow": "Getting started",
  "duration": "1 min",
  "steps": [
    {
      "title": "A real inbox",
      "body": "The bell up top now persists every notification — comments, replies, votes, state changes, and release notes like this one.",
      "target": "topbar-notifications",
      "placement": "bottom"
    },
    {
      "title": "Tune your email",
      "body": "Pick which categories email you. Everything else still lands in the bell.",
      "route": "/settings"
    }
  ]
}
```

## 0.1.0 — 2026-04-01 — "Initial public release"

First cut. Sidebar visibility, role overrides, feedback board, kudos, focus mode, commessa
forecast, and the offices module.
