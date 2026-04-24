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
import "./styles.css";

initGoogleAnalytics();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local");
}

registerSW({
  immediate: true,
  onNeedRefresh() {
    toast("New version available", {
      description: "Reload to get the latest updates.",
      duration: 10000,
      action: {
        label: "Reload",
        onClick: () => window.location.reload(),
      },
    });
  },
  onOfflineReady() {
    toast.success("Ready to work offline", {
      description: "Pulse HR has been cached for offline use.",
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
