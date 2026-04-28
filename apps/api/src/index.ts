/**
 * Hono + Bun backend for Pulse HR. One long-running HTTP server hosted on
 * Render.com. Replaces the Vercel serverless functions previously under
 * `apps/app/api/*`.
 *
 * Uses OpenAPIHono as the root app — a drop-in superset of Hono that lets
 * routes opt into auto-generated OpenAPI docs by being defined with
 * `createRoute()`. Legacy routes (`app.get()` + zValidator) keep working but
 * don't appear in the spec until they're migrated to `src/openapi/*`.
 *
 * Docs: GET /docs (Swagger UI) — spec at GET /openapi.json.
 */
import { swaggerUI } from "@hono/swagger-ui";
import { accessLog } from "./middleware/access-log.ts";
import { buildCors } from "./middleware/cors.ts";
import { errorHandler } from "./middleware/error.ts";
import { bearerAuth, createApp, docInfo } from "./openapi/registry.ts";
import { health } from "./openapi/health.ts";
import { comments } from "./openapi/comments.ts";
import { proposals } from "./routes/proposals.ts";
import { feedback } from "./routes/feedback.ts";
import { changelog } from "./routes/changelog.ts";
import { notifications } from "./routes/notifications.ts";
import { screenshots } from "./routes/screenshots.ts";
import { workspace } from "./routes/workspace.ts";
import { cron } from "./routes/cron.ts";
import { admin } from "./routes/admin.ts";
import { userProfile } from "./routes/user-profile.ts";

export const app = createApp();

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", bearerAuth);

app.use("*", accessLog());
app.use("*", buildCors());
app.onError(errorHandler);

// Keep scanners out of search indexes and give a clean no-fingerprint 404.
app.get("/robots.txt", (c) => c.text("User-agent: *\nDisallow: /\n"));
app.notFound((c) => c.text("not found", 404));

app.route("/health", health);
app.route("/comments", comments);
app.route("/proposals", proposals);
app.route("/feedback", feedback);
app.route("/changelog", changelog);
app.route("/notifications", notifications);
app.route("/screenshots", screenshots);
app.route("/workspace", workspace);
app.route("/cron", cron);
app.route("/admin", admin);
app.route("/user-profile", userProfile);

app.get("/", (c) => c.json({ ok: true, service: "@pulse-hr/api" }));

// OpenAPI spec — served live, also written to apps/api/openapi.json at build
// time by scripts/build-openapi.ts (see package.json `prebuild`).
app.doc31("/openapi.json", docInfo);

app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
    title: "Pulse HR API — Swagger",
  }),
);

const port = Number(process.env.PORT ?? 3000);
console.log(`[api] listening on http://localhost:${port}`);
console.log(`[api] docs at  http://localhost:${port}/docs`);

export default {
  port,
  fetch: app.fetch,
};
