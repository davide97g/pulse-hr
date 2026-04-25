import { initGoogleAnalytics } from "@/lib/ga";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/react";
import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";
import { getRouter } from "./router";
import { ThemeProvider } from "@pulse-hr/ui/theme";
import { WorkspaceProvider } from "./components/app/WorkspaceContext";
import { RoleOverrideProvider } from "./lib/role-override";
import { OfflineModeProvider } from "./lib/offline-mode";
import { AppErrorBoundary } from "./components/app/AppErrorBoundary";
import { ServerBoot } from "./components/app/ServerBoot";
import { WorkspaceLoaderProvider } from "./components/app/WorkspaceLoader";
import { CompanyProfileProvider } from "./components/app/CompanyProfileStore";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { Analytics } from "@vercel/analytics/react";
import "./styles.css";

initGoogleAnalytics();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local");
}

// Reload as soon as the new SW takes control. Combined with skipWaiting +
// clientsClaim in vite.config.ts this means the next refresh after a deploy
// always boots the latest bundle — no stale tabs, no manual cache wipe.
if ("serviceWorker" in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // We could prompt, but caching has been biting users — auto-apply.
    void updateSW(true);
    toast("Updating to the latest version…", { duration: 4000 });
  },
  onOfflineReady() {
    toast.success("Ready to work offline", {
      description: "Pulse HR has been cached for offline use.",
    });
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    // Poll for new versions every 15 minutes while the tab is open and on
    // each tab focus, so users running the PWA all day still pick up
    // deploys without having to manually relaunch.
    const check = () => {
      registration.update().catch(() => {
        /* ignore — the next tick will retry */
      });
    };
    setInterval(check, 15 * 60 * 1000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
  },
});

const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

const el = document.getElementById("root");
if (!el) throw new Error("#root not found");

ReactDOM.createRoot(el).render(
  <React.StrictMode>
    <AppErrorBoundary scope="app">
      <OfflineModeProvider>
        <ServerBoot>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/login">
            <RoleOverrideProvider>
              <ThemeProvider>
                <CookieConsentBanner />
                <Analytics />
                <WorkspaceProvider>
                  <WorkspaceLoaderProvider>
                    <CompanyProfileProvider>
                      <RouterProvider router={router} />
                    </CompanyProfileProvider>
                  </WorkspaceLoaderProvider>
                </WorkspaceProvider>
              </ThemeProvider>
            </RoleOverrideProvider>
          </ClerkProvider>
        </ServerBoot>
      </OfflineModeProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
