/** GA4 with Consent Mode. Set `VITE_GA_MEASUREMENT_ID` on production; omit it locally. */
export const GA_CONSENT_KEY = "pulse.consent.analytics" as const;

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? "").trim();

export type GaConsent = "granted" | "denied";

type Gtag = (...args: unknown[]) => void;

let initDone = false;

function readStoredConsent(): GaConsent | null {
  try {
    const v = localStorage.getItem(GA_CONSENT_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    // ignore
  }
  return null;
}

export function isGoogleAnalyticsEnabled(): boolean {
  return import.meta.env.PROD && MEASUREMENT_ID.length > 0;
}

export function initGoogleAnalytics(): void {
  if (initDone || !isGoogleAnalyticsEnabled() || !MEASUREMENT_ID) return;
  initDone = true;

  window.dataLayer = window.dataLayer || [];
  const gtag: Gtag = function (this: void, ..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params -- official gtag.js uses `arguments`
    (window.dataLayer as unknown as { push: (a: IArguments) => number }).push(arguments);
  };
  (window as unknown as { gtag: Gtag }).gtag = gtag;

  const stored = readStoredConsent();
  const analyticsStorage: "granted" | "denied" = stored === "granted" ? "granted" : "denied";

  gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: analyticsStorage,
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  s.onload = () => {
    gtag("js", new Date());
    gtag("config", MEASUREMENT_ID, { send_page_view: false });
  };
  document.head.appendChild(s);
}

function gtagOrUndefined(): Gtag | undefined {
  return (window as unknown as { gtag?: Gtag }).gtag;
}

export function applyAnalyticsConsent(choice: GaConsent): void {
  try {
    localStorage.setItem(GA_CONSENT_KEY, choice);
  } catch {
    // ignore
  }
  if (!isGoogleAnalyticsEnabled() || !MEASUREMENT_ID) return;
  const g = gtagOrUndefined();
  if (typeof g !== "function") return;
  g("consent", "update", { analytics_storage: choice === "granted" ? "granted" : "denied" });
  if (choice === "granted") {
    g("event", "page_view", {
      page_path: window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

export function trackGaPageViewIfConsented(): void {
  if (!isGoogleAnalyticsEnabled() || readStoredConsent() !== "granted") return;
  const g = gtagOrUndefined();
  if (typeof g !== "function") return;
  g("event", "page_view", {
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function getStoredAnalyticsConsent(): GaConsent | null {
  return readStoredConsent();
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
export {};
