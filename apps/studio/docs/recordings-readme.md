# Recordings

Auto-generated product demos of `apps/app` (Pulse HR) using [testreel](https://github.com/greentfrapp/testreel).

## What's here

- `specs/*.template.json` — recording definitions with `{{TEST_EMAIL}}`, `{{TEST_PASSWORD}}`, `{{BASE_URL}}` placeholders.
- `scripts/run.ts` — Bun runner that reads `apps/app/test.credentials.json`, templates the spec, and invokes `testreel`.
- `output/` — compiled spec JSON + final video (`.mp4`) + per-step screenshots. Gitignored.

## One-time setup

```bash
bun install                          # picks up testreel + playwright in this workspace
# (postinstall runs `playwright install chromium`)
```

Ensure `apps/app/test.credentials.json` exists with a valid Clerk test user:

```json
{ "email": "johndoe@acme.com", "password": "testpassword" }
```

## Record a reel

Terminal A — run the app:

```bash
bun run dev                          # Vite on :5173
```

Terminal B — record:

```bash
bun run demo:record                  # from repo root (runs kudos-copilot by default)
# or directly:
cd apps/app/recordings && bun scripts/run.ts kudos-copilot
```

Env overrides:

- `BASE_URL=http://localhost:5173` (default)
- `FORMAT=mp4 | gif | webm` (default `mp4`)
- `HEADED=1` to watch the browser

Outputs land in `apps/app/recordings/output/`.

## Specs available

- `kudos-copilot` — logs in, opens ⌘J and fires a log-hours intent, then navigates to `/kudos` and sends a kudo with confetti. ~45s.
