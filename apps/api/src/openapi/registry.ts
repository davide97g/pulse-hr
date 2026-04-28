/**
 * Shared OpenAPI building blocks. Anything reused across multiple route files
 * — error envelopes, ID params, security schemes, doc metadata — lives here so
 * route modules stay focused on their endpoints.
 *
 * Routes opt into OpenAPI by being defined with `createRoute()` + `app.openapi()`
 * inside an `OpenAPIHono` instance. Routes still defined the legacy way
 * (`app.get()` + `zValidator`) keep working but won't appear in the spec — this
 * is deliberate, so we can migrate route files one at a time.
 */
import { OpenAPIHono, z } from "@hono/zod-openapi";
import pkg from "../../package.json" with { type: "json" };

export type AppOpenAPI = OpenAPIHono;

export function createApp(): AppOpenAPI {
  return new OpenAPIHono();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const IdParamSchema = z
  .object({
    id: z
      .string()
      .regex(UUID_RE, "invalid id")
      .openapi({ description: "UUID v4 identifier", example: "9d4a0a8c-1c8e-4b2a-9c4f-0a8c1c8e4b2a" }),
  })
  .openapi("IdParam");

export const ErrorBodySchema = z
  .object({
    code: z.string().openapi({ example: "not_found" }),
    message: z.string().optional(),
  })
  .openapi("ErrorBody");

export const ErrorResponseSchema = z
  .object({ error: ErrorBodySchema })
  .openapi("ErrorResponse");

export const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: ErrorResponseSchema } },
});

export const jsonContent = <T extends z.ZodType>(schema: T, description: string) => ({
  description,
  content: { "application/json": { schema } },
});

export const jsonBody = <T extends z.ZodType>(schema: T, description?: string) => ({
  required: true,
  content: { "application/json": { schema } },
  ...(description ? { description } : {}),
});

export const docInfo = {
  openapi: "3.1.0" as const,
  info: {
    title: "Pulse HR API",
    version: pkg.version,
    description:
      "Pulse HR backend (Hono + Bun on Render). This document is auto-generated from the route definitions in `apps/api/src/openapi/*` — do not hand-edit.",
  },
  servers: [
    { url: "https://api.pulsehr.it", description: "production" },
    { url: "http://localhost:3000", description: "local dev" },
  ],
  tags: [
    { name: "system", description: "Service health and diagnostics" },
    { name: "comments", description: "Inline page comments and replies" },
    { name: "proposals", description: "Improvement proposals and ideas" },
    { name: "feedback", description: "Unified feedback board" },
    { name: "changelog", description: "Public release notes" },
    { name: "notifications", description: "User notifications and preferences" },
    { name: "screenshots", description: "Comment screenshot uploads" },
    { name: "workspace", description: "Workspace-level configuration" },
    { name: "admin", description: "Admin-only endpoints" },
    { name: "user-profile", description: "User profile and voting power" },
    { name: "cron", description: "Scheduled tasks (cron-secret auth)" },
  ],
};

export const bearerAuth = {
  type: "http" as const,
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Clerk-issued JWT. Pass as `Authorization: Bearer <token>`.",
};

export const cronBearerAuth = {
  type: "http" as const,
  scheme: "bearer",
  description: "Cron secret. Pass as `Authorization: Bearer ${CRON_SECRET}`.",
};

export const securitySchemes = { Bearer: bearerAuth, CronBearer: cronBearerAuth };

/** Convenience marker for routes that require Clerk auth. */
export const RequireAuth = [{ Bearer: [] as string[] }];

/** Convenience marker for cron-secret-protected routes. */
export const RequireCronAuth = [{ CronBearer: [] as string[] }];

export { z, OpenAPIHono };
