import { createRootRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Toaster } from "@/components/ui/sonner";

const PUBLIC_PREFIXES = ["/landing", "/login", "/signup"];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

const TITLE_BY_PATH: Record<string, string> = {
  "/":              "Dashboard — Pulse HR",
  "/landing":       "Pulse HR — the people platform you'll actually use",
  "/login":         "Sign in — Pulse HR",
  "/signup":        "Create your workspace — Pulse HR",
  "/people":        "Employees — Pulse HR",
  "/org":           "Org chart — Pulse HR",
  "/recruiting":    "Recruiting — Pulse HR",
  "/onboarding":    "Onboarding — Pulse HR",
  "/time":          "Time & attendance — Pulse HR",
  "/leave":         "Leave — Pulse HR",
  "/documents":     "Documents — Pulse HR",
  "/payroll":       "Payroll — Pulse HR",
  "/expenses":      "Expenses — Pulse HR",
  "/reports":       "Reports — Pulse HR",
  "/marketplace":   "Marketplace — Pulse HR",
  "/developers":    "Developers — Pulse HR",
  "/settings":      "Settings — Pulse HR",
  "/announcements": "Announcements — Pulse HR",
  "/pulse":         "Team Pulse — Pulse HR",
  "/forecast":      "Commessa Forecast — Pulse HR",
  "/kudos":         "Kudos — Pulse HR",
  "/focus":         "Focus Mode — Pulse HR",
};

function RootComponent() {
  const location = useLocation();
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
  );
  useEffect(() => {
    const t = TITLE_BY_PATH[location.pathname] ?? "Pulse HR";
    if (typeof document !== "undefined") document.title = t;
  }, [location.pathname]);

  return (
    <>
      {isPublic ? <Outlet /> : <AppShell />}
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
