// Per-route meta updater. Keeps title, OG, Twitter, and canonical in lockstep
// without a head-manager dependency. Pages are noindex'd globally, but social
// platforms and AI crawlers still read these tags when a link is shared.

const DEFAULT_DESCRIPTION =
  "Pulse Feedback — share ideas, upvote what matters, track proposals.";
const OG_IMAGE = "https://pulsehr.it/og/og-hero.png";

interface PageMeta {
  title: string;
  description?: string;
  /** Override the canonical URL. Defaults to window.location.href. */
  canonical?: string;
}

function ensureMeta(
  selector: string,
  attr: "name" | "property",
  key: string,
): HTMLMetaElement {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  return el;
}

function ensureLink(rel: string): HTMLLinkElement {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  return el;
}

export function setPageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
}: PageMeta): void {
  if (typeof document === "undefined") return;
  const url = canonical ?? window.location.href;

  document.title = title;
  ensureMeta(`meta[name="description"]`, "name", "description").content = description;

  ensureMeta(`meta[property="og:title"]`, "property", "og:title").content = title;
  ensureMeta(`meta[property="og:description"]`, "property", "og:description").content =
    description;
  ensureMeta(`meta[property="og:url"]`, "property", "og:url").content = url;
  ensureMeta(`meta[property="og:image"]`, "property", "og:image").content = OG_IMAGE;

  ensureMeta(`meta[name="twitter:title"]`, "name", "twitter:title").content = title;
  ensureMeta(`meta[name="twitter:description"]`, "name", "twitter:description").content =
    description;
  ensureMeta(`meta[name="twitter:image"]`, "name", "twitter:image").content = OG_IMAGE;

  ensureLink("canonical").href = url;
}
