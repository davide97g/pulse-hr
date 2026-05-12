#!/usr/bin/env bun
/**
 * Headless Playwright ghost user. Spawned by run.ts when GHOSTS=1, one
 * process per choreographed ghost. Reads its identity, credentials, and
 * action list from environment variables, drives a feedback session, and
 * performs reply/upvote actions on the matching proposal at the prescribed
 * elapsed-second offsets so the recorded actor sees the activity arrive
 * live in their UI.
 */
import { chromium } from "playwright";

interface GhostAction {
  atSeconds: number;
  kind: "reply" | "upvote";
  matchProposalTitle: string;
  text?: string;
}

const id = process.env.GHOST_ID ?? "ghost";
const email = process.env.GHOST_EMAIL ?? "";
const password = process.env.GHOST_PASSWORD ?? "";
const feedbackBaseUrl = process.env.FEEDBACK_BASE_URL ?? "http://localhost:5174";
const identity = JSON.parse(process.env.GHOST_IDENTITY ?? "{}");
const actions: GhostAction[] = JSON.parse(process.env.GHOST_ACTIONS ?? "[]");

const log = (msg: string) => console.log(`[ghost ${id}] ${msg}`);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!email || !password) {
    log("missing creds, exiting");
    return;
  }
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    colorScheme: "dark",
  });

  await ctx.addInitScript((idJson: string) => {
    try {
      window.localStorage.setItem("feedback.viewer.identity", idJson);
      window.localStorage.setItem("pulse.theme", "dark");
      window.localStorage.setItem("pulse.devBanner", "false");
    } catch {
      /* sandboxed */
    }
  }, JSON.stringify(identity));

  const page = await ctx.newPage();

  log("logging in");
  // Best-effort Clerk login. If feedback uses a session that the local apps/api
  // already trusts (e.g. shared Clerk dev instance), this will land logged in.
  await page.goto(`${feedbackBaseUrl}/`, { waitUntil: "domcontentloaded" });

  const startedAt = Date.now();

  for (const action of actions.sort((a, b) => a.atSeconds - b.atSeconds)) {
    const targetMs = action.atSeconds * 1000;
    const elapsed = Date.now() - startedAt;
    if (elapsed < targetMs) await sleep(targetMs - elapsed);

    try {
      if (action.kind === "upvote") {
        await page.locator(`text=${action.matchProposalTitle}`).first().scrollIntoViewIfNeeded();
        await page
          .locator(`article:has-text("${action.matchProposalTitle}")`)
          .first()
          .locator('button[aria-label="Upvote"]')
          .first()
          .click({ timeout: 4000 });
        log(`upvoted "${action.matchProposalTitle}"`);
      } else if (action.kind === "reply" && action.text) {
        await page
          .locator(`article:has-text("${action.matchProposalTitle}")`)
          .first()
          .click({ timeout: 4000 });
        await page.waitForSelector('input[placeholder="Reply…"]', { timeout: 4000 });
        await page.fill('input[placeholder="Reply…"]', action.text);
        await page.click('button[aria-label="Send reply"]', { timeout: 4000 });
        // Close the thread sheet so the next action starts fresh.
        await page.keyboard.press("Escape").catch(() => {});
        log(`replied "${action.text.slice(0, 40)}…"`);
      }
    } catch (err) {
      log(`action failed (${action.kind}): ${(err as Error).message}`);
    }
  }

  await sleep(1500);
  await browser.close();
  log("done");
}

main().catch((err) => {
  log(`fatal: ${(err as Error).message}`);
  process.exit(1);
});
