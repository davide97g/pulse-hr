/**
 * Fetch a URL and extract its main readable content. Used by Super Import so
 * the LLM gets clean prose instead of raw HTML.
 */
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const MAX_BYTES = 512 * 1024;
const FETCH_TIMEOUT_MS = 8000;

export async function fetchReadable(url: string): Promise<{ url: string; text: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "PulseHR-SuperImport/1.0 (+https://pulsehr.it)" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
    const html = (await res.text()).slice(0, MAX_BYTES);
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const text = (article?.textContent ?? html).replace(/\s+/g, " ").trim();
    return { url, text };
  } finally {
    clearTimeout(t);
  }
}
