import { Hono } from "hono";
import { latestRelease, loadReleases } from "../services/changelog.ts";

export const changelog = new Hono();

/** All releases, newest first. Public. */
changelog.get("/", (c) => {
  return c.json({ releases: loadReleases() });
});

/** Just the newest release, or null if CHANGELOG is empty. Public. */
changelog.get("/latest", (c) => {
  return c.json({ release: latestRelease() });
});
