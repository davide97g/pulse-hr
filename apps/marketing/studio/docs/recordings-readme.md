# Recordings

Auto-generated product demos of `apps/app` (Pulse HR) using [testreel](https://github.com/greentfrapp/testreel).

## What's here

- `apps/marketing/studio/recordings/specs/*.template.json` — testreel recording definitions with `{{TEST_EMAIL}}`, `{{TEST_PASSWORD}}`, `{{BASE_URL}}` placeholders. Sidecar files: `*.captions.json` (caption timing) and `*.ghosts.json` (parallel Playwright actors for the feedback-live flow).
- `apps/marketing/studio/recordings/scripts/run.ts` — Bun runner that reads `apps/app/test.credentials.json`, templates the spec, optionally spawns ghost users, drives testreel, muxes the default audio track, then promotes the clip + timeline + captions into `studio/captures/<spec>/` for Remotion to consume.
- `apps/marketing/studio/output/<spec>/` — raw testreel intermediates (compiled spec JSON, per-step screenshots, final mp4). Gitignored.
- `apps/marketing/studio/captures/<spec>/` — Remotion-consumable clips. Gitignored. Served via Remotion's `staticFile()` thanks to `Config.setPublicDir("./studio")` in `apps/marketing/remotion.config.ts`.

## One-time setup

```bash
bun install                          # installs testreel + playwright in the marketing workspace
bun run --filter pulse-hr-marketing record:setup
                                     # runs `playwright install chromium`
```

Ensure `apps/app/test.credentials.json` exists with a valid Clerk test user. Either flat:

```json
{ "email": "johndoe@acme.com", "password": "testpassword" }
```

…or nested for flows that need a fresh-onboarding slot (`workspace-create`):

```json
{
  "existing": { "email": "john@acme.com", "password": "…" },
  "new":      { "email": "fresh@acme.com", "password": "…" },
  "ghosts":   { "carla": { "email": "…", "password": "…" } }
}
```

## Record a reel

Terminal A — run the app:

```bash
bun run dev                          # Vite on :5173 (and feedback on :5174)
```

Terminal B — record:

```bash
bun run record kudos-give            # from repo root (filters into pulse-hr-marketing)
# or directly:
cd apps/marketing && bun run record kudos-give
```

Env overrides:

- `BASE_URL=http://localhost:5173` (default — `apps/app` dev server)
- `FEEDBACK_BASE_URL=http://localhost:5174` (default — `apps/feedback` dev server, needed for feedback-live)
- `FORMAT=mp4 | webm` (default `mp4`)
- `HEADED=1` to watch the browser
- `VERBOSE=1` for testreel debug output
- `GHOSTS=1` to spawn the ghost users declared in `<spec>.ghosts.json`
- `CRED=new` to use the `new` slot from `test.credentials.json` (workspace-create flow)
- `AUDIO=<path>` to override the default `studio/audio/Launch Window.mp3` mux track

## Specs available

Run `ls apps/marketing/studio/recordings/specs/*.template.json` for the current list. As of this writing:

- `kudos-give` — logs in, sends a kudo with confetti. ~16s.
- `time-attendance-entry` — logs a new time entry on the timesheet. ~17s.
- `growth-checks` — tours the growth hub. ~12s.
- `workspace-create` — fresh user runs the welcome onboarding (set `CRED=new`).
- `comment-create` — in-app comment pin on `/growth`. ~14s.
- `comment-create-board` — **merged** `comment-create` → click *open the feedback board* in the demo strip → full `comments-thread-board` tour. Uses `{{SETUP_TRAILER}}`. ~51s.
- `comments-thread` — opens a board, threads a reply.
- `comments-thread-board` — thread reply + board tour on the feedback site. Uses `{{SETUP_FEEDBACK}}`. ~34s.
- `feedback-live` — public feedback flow with ghost users replying / upvoting in real time (set `GHOSTS=1`).
