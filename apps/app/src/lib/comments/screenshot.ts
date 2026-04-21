/**
 * Viewport screenshot capture for comments. html2canvas is lazy-loaded so the
 * ~40KB gzip cost doesn't land on the main bundle — only loaded when a pin is
 * being placed.
 */

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.85;

export async function captureViewport(): Promise<Blob | null> {
  if (typeof window === "undefined") return null;
  try {
    const { default: html2canvas } = await import("html2canvas");
    const target = document.querySelector("main") ?? document.documentElement;
    const rect = target.getBoundingClientRect();
    const scale = rect.width > MAX_WIDTH ? MAX_WIDTH / rect.width : 1;
    const canvas = await html2canvas(target as HTMLElement, {
      scale,
      logging: false,
      useCORS: true,
      backgroundColor: null,
      foreignObjectRendering: false,
      ignoreElements: (el) =>
        el.hasAttribute("data-comments-ignore") ||
        el.getAttribute("role") === "tooltip" ||
        el.tagName === "IFRAME",
    });
    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
  } catch (err) {
    console.warn("[comments] screenshot failed", err);
    return null;
  }
}

export async function uploadScreenshot(
  blob: Blob,
  tokenGetter: () => Promise<string | null>,
): Promise<string | null> {
  const token = await tokenGetter();
  const { apiFetch } = await import("@/lib/api-client");
  const res = await apiFetch(
    "/screenshots",
    {
      method: "POST",
      headers: { "content-type": blob.type || "image/jpeg" },
      body: blob,
    },
    token,
  );
  if (!res.ok) {
    if (res.status === 501) return null; // storage not configured — silently skip
    return null;
  }
  const data = (await res.json()) as { url?: string };
  return data.url ?? null;
}
