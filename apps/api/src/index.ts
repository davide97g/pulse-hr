/**
 * Hono + Bun backend for Pulse HR. One long-running HTTP server hosted on
 * Render.com. Replaces the Vercel serverless functions previously under
 * `apps/app/api/*`.
 */
import { Hono } from "hono";
import { accessLog } from "./middleware/access-log.ts";
import { buildCors } from "./middleware/cors.ts";
import { errorHandler } from "./middleware/error.ts";
import { health } from "./routes/health.ts";
import { comments } from "./routes/comments.ts";
import { feedback } from "./routes/feedback.ts";
import { changelog } from "./routes/changelog.ts";
import { notifications } from "./routes/notifications.ts";
import { screenshots } from "./routes/screenshots.ts";
import { workspace } from "./routes/workspace.ts";
import { cron } from "./routes/cron.ts";

const app = new Hono();

app.use("*", accessLog());
app.use("*", buildCors());
app.onError(errorHandler);

// Keep scanners out of search indexes and give a clean no-fingerprint 404.
app.get("/robots.txt", (c) => c.text("User-agent: *\nDisallow: /\n"));
app.notFound((c) => c.text("not found", 404));

app.route("/health", health);
app.route("/comments", comments);
app.route("/feedback", feedback);
app.route("/changelog", changelog);
app.route("/notifications", notifications);
app.route("/screenshots", screenshots);
app.route("/workspace", workspace);
app.route("/cron", cron);

app.get("/", (c) => c.json({ ok: true, service: "@pulse-hr/api" }));

const port = Number(process.env.PORT ?? 3000);
console.log(`[api] listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
