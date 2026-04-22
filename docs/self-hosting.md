# Self-hosting

Pulse HR ships as a Bun monorepo you can run anywhere Bun runs. Three deploy surfaces:

- **App** (`apps/app`) — static SPA, any CDN or static host
- **API** (`apps/api`) — long-running Bun + Hono server
- **Marketing** (`apps/marketing`) — static Astro site

Payroll-filing connectors (tax authority integrations) remain managed by Pulse and are not part of the open-source bundle.

## Option 1 — Vercel (easiest)

One Vercel project per app. Set **Root Directory** to `apps/app`, `apps/api`, or `apps/marketing`. Vercel detects the Bun workspace and installs from the monorepo root.

- `apps/app/vercel.json` — framework `vite`, SPA rewrite, 1-year immutable cache on `/assets/*`.
- `apps/api/vercel.json` — Bun function runtime.
- `apps/marketing/vercel.json` — framework `astro`, output `dist`.

Set environment variables per project in the Vercel dashboard.

## Option 2 — Docker

Each app builds into a standalone container.

```bash
# App (SPA → nginx)
docker build -t pulse-hr-app -f apps/app/Dockerfile .

# API (Bun runtime)
docker build -t pulse-hr-api -f apps/api/Dockerfile .

# Marketing (static → nginx)
docker build -t pulse-hr-marketing -f apps/marketing/Dockerfile .
```

Minimal `docker-compose.yml` — app on 8080, api on 3000, marketing on 8081, Postgres on 5432.

## Option 3 — Kubernetes / Helm

A reference Helm chart lives in `deploy/helm/` (coming soon). Values you'll typically override:

- `image.tag` (per app)
- `api.env.DATABASE_URL`
- `api.env.JWT_SECRET`
- `ingress.host` (app / api / marketing)

Terraform modules for AWS + GCP are in `deploy/terraform/` (coming soon).

## Required infrastructure

| Component       | Purpose                                | Required? |
| --------------- | -------------------------------------- | --------- |
| PostgreSQL 15+  | API primary store                      | ✅        |
| Redis 7+        | rate limiting, queues                  | optional  |
| SMTP / Resend   | transactional email                    | ✅ (prod) |
| S3-compatible   | document uploads                       | optional  |
| OIDC provider   | SSO                                    | optional  |

## Environment variables

See each app's `.env.example`. Common ones for the API:

```
DATABASE_URL=postgres://user:pass@host:5432/pulse
JWT_SECRET=<long-random-string>
APP_ORIGIN=https://app.example.com
MARKETING_ORIGIN=https://example.com
RESEND_API_KEY=...
```

## Migrations

```bash
bun run db:migrate
```

Safe to run on every deploy; migrations are idempotent.

## TLS + domains

Recommended layout:

- `example.com` → marketing
- `app.example.com` → product SPA
- `api.example.com` → API

CORS on the API should allow only the configured `APP_ORIGIN` and `MARKETING_ORIGIN`.

## Observability

- API logs to stdout in JSON; pipe into Loki / Datadog / CloudWatch.
- `/healthz` on the API returns `200 ok` when DB is reachable.
- Runtime metrics are Prometheus-compatible at `/metrics` (if enabled).

## Backups

Back up the Postgres DB daily and whenever you run migrations. Document uploads (S3) should have versioning enabled.

## Support

Self-host questions go to [GitHub Discussions](https://github.com/davide97g/pulse-hr/discussions). Commercial support and managed hosting: [hello@pulsehr.it](mailto:hello@pulsehr.it).
