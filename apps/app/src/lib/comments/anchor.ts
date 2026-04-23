import type { Anchor, PageMeta } from "./types";

const MAX_SELECTOR_DEPTH = 6;

function escapeAttr(value: string): string {
  return value.replace(/"/g, '\\"');
}

function nthOfType(el: Element): string {
  const parent = el.parentElement;
  if (!parent) return el.tagName.toLowerCase();
  const tag = el.tagName.toLowerCase();
  const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
  if (siblings.length === 1) return tag;
  const idx = siblings.indexOf(el) + 1;
  return `${tag}:nth-of-type(${idx})`;
}

function segmentFor(el: Element): string {
  const dataAnchor = el.getAttribute("data-anchor-id");
  if (dataAnchor) return `[data-anchor-id="${escapeAttr(dataAnchor)}"]`;
  if (el.id) return `#${CSS.escape(el.id)}`;
  if (el.tagName === "MAIN") return "main";
  return nthOfType(el);
}

export function buildSelector(target: Element): string {
  const parts: string[] = [];
  let current: Element | null = target;
  let depth = 0;
  while (current && depth < MAX_SELECTOR_DEPTH) {
    const seg = segmentFor(current);
    parts.unshift(seg);
    if (seg.startsWith("[data-anchor-id=") || seg.startsWith("#") || seg === "main") break;
    current = current.parentElement;
    depth += 1;
  }
  return parts.join(" > ");
}

function getScrollRoot(): HTMLElement | null {
  return document.querySelector("main");
}

function clamp(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Capture an anchor from a pointer event. Coordinates are in viewport space
 * (clientX/Y). The fallback is stored in the scroll container's content space
 * so it survives scrolling even if the selector can't be resolved later.
 */
function elementUnderPoint(clientX: number, clientY: number): Element | null {
  // Skip the comments overlay layer/pins/composer/popover — they cover the
  // viewport during placement and would otherwise be returned by
  // elementFromPoint, making every pin anchor to the overlay itself.
  const candidates = document.elementsFromPoint(clientX, clientY);
  for (const c of candidates) {
    if (!c.closest("[data-comments-ignore]")) return c;
  }
  return null;
}

export function captureAnchor(clientX: number, clientY: number): Anchor {
  const el = elementUnderPoint(clientX, clientY);
  const scrollRoot = getScrollRoot();
  const scrollX = scrollRoot?.scrollLeft ?? window.scrollX;
  const scrollY = scrollRoot?.scrollTop ?? window.scrollY;
  const rootRect = scrollRoot?.getBoundingClientRect();
  const rootLeft = rootRect?.left ?? 0;
  const rootTop = rootRect?.top ?? 0;
  const fallbackX = clientX - rootLeft + scrollX;
  const fallbackY = clientY - rootTop + scrollY;

  if (!el) {
    return { selector: null, xPct: 0, yPct: 0, fallbackX, fallbackY, scrollY };
  }

  const rect = el.getBoundingClientRect();
  const selector = buildSelector(el);
  const xPct = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
  const yPct = rect.height > 0 ? (clientY - rect.top) / rect.height : 0;

  return {
    selector,
    xPct: clamp(xPct),
    yPct: clamp(yPct),
    fallbackX,
    fallbackY,
    scrollY,
  };
}

export type ResolvedPosition = {
  x: number;
  y: number;
  resolvedVia: "selector" | "fallback";
};

/**
 * Resolve an anchor to current viewport coordinates so a fixed-positioned pin
 * can render in the right place. Returns null if we can't place it at all
 * (e.g., both selector and fallback are unusable).
 */
export function resolveAnchor(anchor: Anchor): ResolvedPosition | null {
  if (anchor.selector) {
    try {
      const el = document.querySelector(anchor.selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + anchor.xPct * rect.width,
          y: rect.top + anchor.yPct * rect.height,
          resolvedVia: "selector",
        };
      }
    } catch {
      // invalid selector — fall through
    }
  }
  if (Number.isFinite(anchor.fallbackX) && Number.isFinite(anchor.fallbackY)) {
    const scrollRoot = getScrollRoot();
    const rootRect = scrollRoot?.getBoundingClientRect();
    const rootLeft = rootRect?.left ?? 0;
    const rootTop = rootRect?.top ?? 0;
    const scrollX = scrollRoot?.scrollLeft ?? window.scrollX;
    const scrollY = scrollRoot?.scrollTop ?? window.scrollY;
    return {
      x: anchor.fallbackX + rootLeft - scrollX,
      y: anchor.fallbackY + rootTop - scrollY,
      resolvedVia: "fallback",
    };
  }
  return null;
}

export function capturePageMeta(): PageMeta {
  return {
    title: document.title,
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
    userAgent: navigator.userAgent,
  };
}

export { getScrollRoot };
