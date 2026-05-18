import { createRootRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { RouteErrorFallback } from "@/components/app/AppErrorBoundary";
import { LoginWallProvider } from "@/components/app/LoginWall";
import { ProposalProvider } from "@/components/proposals/ProposalProvider";
import { WorkspaceMount } from "@/components/app/WorkspaceMount";
import { TableStoreProvider } from "@/components/app/TableStoreProvider";
import { SidebarFeaturesProvider } from "@/components/app/SidebarFeaturesContext";
import { Toaster } from "@pulse-hr/ui/primitives/sonner";
import { useWorkspaceStatus } from "@/lib/workspace";
import { trackGaPageViewIfConsented } from "@/lib/ga";
import { setPageMeta } from "@/lib/page-meta";
// Side-effect imports: register persistent tables + wire their sync into
// mock-data.ts. Each new entity table goes here so it's loaded before any
// route mounts and consumers can rely on hooks/imports working at first paint.
import "@/lib/tables/employees";
import "@/lib/tables/leave";
import "@/lib/tables/activities";
import "@/lib/tables/allocations";
import "@/lib/tables/announcements";
import "@/lib/tables/apiKeys";
import "@/lib/tables/auditLog";
import "@/lib/tables/candidates";
import "@/lib/tables/challenges";
import "@/lib/tables/clients";
import "@/lib/tables/projects";
import "@/lib/tables/customFields";
import "@/lib/tables/docs";
import "@/lib/tables/gcalEvents";
import "@/lib/tables/goals";
import "@/lib/tables/growthNotes";
import "@/lib/tables/jobPostings";
import "@/lib/tables/kudos";
import "@/lib/tables/logMessages";
import "@/lib/tables/logSessions";
import "@/lib/tables/managerAsks";
import "@/lib/tables/mockCalendarEvents";
import "@/lib/tables/notifications";
import "@/lib/tables/oneOnOnes";
import "@/lib/tables/pulseEntries";
import "@/lib/tables/roles";
import "@/lib/tables/seasonalChallenges";
import "@/lib/tables/timesheetEntries";
import "@/lib/tables/webhooks";

const PUBLIC_PREFIXES = ["/login", "/signup"];
const FEEDBACK_PREFIXES = ["/feedback", "/comment", "/proposal"];
const WELCOME_PATH = "/welcome";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 pt-safe pb-safe pl-safe pr-safe">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
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

// Per-path meta. Description only matters for public/shareable routes
// (login, signup, welcome, feedback, comment, proposal) — internal pages
// are auth-walled, so the body is purely UX, not crawler-facing.
const META_BY_PATH: Record<string, { title: string; description?: string }> = {
  "/": { title: "Dashboard — Pulse HR" },
  "/login": {
    title: "Sign in — Pulse HR",
    description: "Sign in to your Pulse HR workspace. The people-first workspace for async teams.",
  },
  "/signup": {
    title: "Create your workspace — Pulse HR",
    description: "Spin up a Pulse HR workspace in seconds. Status Log, Growth, Kudos, Moments.",
  },
  "/welcome": {
    title: "Welcome — Pulse HR",
    description: "Pick your persona and set up your Pulse HR workspace.",
  },
  "/feedback": {
    title: "Feedback — Pulse HR",
    description: "Share ideas, upvote what matters, track proposals.",
  },
  "/people": { title: "Employees — Pulse HR" },
  "/org": { title: "Org chart — Pulse HR" },
  "/recruiting": { title: "Recruiting — Pulse HR" },
  "/time": { title: "Time & attendance — Pulse HR" },
  "/leave": { title: "Leave — Pulse HR" },
  "/documents": { title: "Documents — Pulse HR" },
  "/reports": { title: "Reports — Pulse HR" },
  "/settings": { title: "Settings — Pulse HR" },
  "/announcements": { title: "Announcements — Pulse HR" },
  "/kudos": { title: "Kudos — Pulse HR" },
  "/skills": { title: "Skills — Pulse HR" },
  "/skills/me": { title: "Your skills — Pulse HR" },
  "/skills/team": { title: "Team skills — Pulse HR" },
  "/admin/modules": { title: "Modules — Pulse HR" },
};

function RootComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
  );
  const isFeedback = FEEDBACK_PREFIXES.some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
  );
  const isWelcome = location.pathname === WELCOME_PATH;
  const workspace = useWorkspaceStatus();
  useEffect(() => {
    // Dynamic routes (/comment/$id, /proposal/$id) set their own meta from
    // loaded content — skip them here so we don't clobber with a stale title.
    const isDynamic =
      location.pathname.startsWith("/comment/") ||
      location.pathname.startsWith("/proposal/");
    if (isDynamic) return;
    const meta = META_BY_PATH[location.pathname] ?? { title: "Pulse HR" };
    setPageMeta(meta);
  }, [location.pathname]);

  useEffect(() => {
    trackGaPageViewIfConsented();
  }, [location.pathname]);

  useEffect(() => {
    // Demo mode: every visitor (signed-in or anonymous) gets a workspace.
    // Authentication is required only for feedback / commenting / voting,
    // which is gated by the LoginWall modal at the click site.
    if (isPublic || isFeedback) return;
    if (!workspace.hasAnyUser) return;
    if (!workspace.ready && !isWelcome) {
      navigate({ to: "/welcome", replace: true });
    } else if (workspace.ready && isWelcome) {
      navigate({ to: "/", replace: true });
    }
  }, [isPublic, isFeedback, isWelcome, workspace.hasAnyUser, workspace.ready, navigate]);

  // No workspace yet → render only the welcome route until they create one.
  const showWelcomeOnly = workspace.hasAnyUser && !workspace.ready;

  return (
    <TableStoreProvider>
      <SidebarFeaturesProvider>
        <WorkspaceMount />
        <LoginWallProvider>
          {isPublic ? (
            <Outlet />
          ) : (
            <ProposalProvider>
              {isFeedback || isWelcome || showWelcomeOnly ? <Outlet /> : <AppShell />}
            </ProposalProvider>
          )}
        </LoginWallProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </SidebarFeaturesProvider>
    </TableStoreProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ({ error }) => <RouteErrorFallback error={error} />,
});
