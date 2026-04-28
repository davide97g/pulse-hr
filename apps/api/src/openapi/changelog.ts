import { createRoute } from "@hono/zod-openapi";
import { latestRelease, loadReleases } from "../services/changelog.ts";
import { createApp, jsonContent, z } from "./registry.ts";

export const changelog = createApp();

const TourSchema = z
  .record(z.string(), z.unknown())
  .nullable()
  .openapi("ChangelogTour");

const ReleaseSchema = z
  .object({
    version: z.string().openapi({ example: "0.6.0" }),
    date: z.string().openapi({ example: "2026-04-28" }),
    title: z.string(),
    bodyMarkdown: z.string(),
    tour: TourSchema,
  })
  .openapi("Release");

const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["changelog"],
  summary: "List all releases (newest first)",
  responses: {
    200: jsonContent(z.object({ releases: z.array(ReleaseSchema) }), "All releases"),
  },
});

changelog.openapi(listRoute, (c) => c.json({ releases: loadReleases() as z.infer<typeof ReleaseSchema>[] }, 200));

const latestRouteDef = createRoute({
  method: "get",
  path: "/latest",
  tags: ["changelog"],
  summary: "Get the most recent release",
  responses: {
    200: jsonContent(z.object({ release: ReleaseSchema.nullable() }), "Latest release or null"),
  },
});

changelog.openapi(latestRouteDef, (c) =>
  c.json({ release: (latestRelease() as z.infer<typeof ReleaseSchema> | null) ?? null }, 200),
);
