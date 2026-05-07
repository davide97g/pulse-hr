import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/react";
import { getRouter } from "./router";
import { initGoogleAnalytics } from "./lib/analytics";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { ThemeProvider } from "@pulse-hr/ui/theme";
import { Analytics } from "@vercel/analytics/react";
import "./styles.css";

initGoogleAnalytics();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local");
}

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
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {/* Feedback is dark-only. We lock --paper / --ink to fixed values in
        styles.css so .room-dark and color: var(--paper) keep working
        independently of the active palette, and force theme=dark for
        Tailwind tokens (bg-card, bg-background, etc.). */}
      <ThemeProvider forced="dark">
        <CookieConsentBanner />
        <Analytics />
        <RouterProvider router={router} />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>,
);
