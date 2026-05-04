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
// Side-effect imports: register persistent tables + wire their sync into
// mock-data.ts. Each new entity table goes here so it's loaded before any
// route mounts and consumers can rely on hooks/imports working at first paint.
import "@/lib/tables/employees";
import "@/lib/tables/leave";
import "@/lib/tables/expenses";
import "@/lib/tables/activities";
import "@/lib/tables/allocations";
import "@/lib/tables/announcements";
import "@/lib/tables/apiKeys";
import "@/lib/tables/auditLog";
import "@/lib/tables/candidates";
import "@/lib/tables/challenges";
import "@/lib/tables/clients";
import "@/lib/tables/commesse";
import "@/lib/tables/customFields";
import "@/lib/tables/docs";
import "@/lib/tables/focusSessions";
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
import "@/lib/tables/onboardingWorkflows";
import "@/lib/tables/oneOnOnes";
import "@/lib/tables/payrollRuns";
import "@/lib/tables/payslips";
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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

const TITLE_BY_PATH: Record<string, string> = {
  "/": "Dashboard — Pulse HR",
  "/login": "Sign in — Pulse HR",
  "/signup": "Create your workspace — Pulse HR",
  "/people": "Employees — Pulse HR",
  "/org": "Org chart — Pulse HR",
  "/recruiting": "Recruiting — Pulse HR",
  "/onboarding": "Onboarding — Pulse HR",
  "/time": "Time & attendance — Pulse HR",
  "/calendar": "Calendar — Pulse HR",
  "/leave": "Leave — Pulse HR",
  "/documents": "Documents — Pulse HR",
  "/expenses": "Expenses — Pulse HR",
  "/reports": "Reports — Pulse HR",
  "/marketplace": "Marketplace — Pulse HR",
  "/developers": "Developers — Pulse HR",
  "/settings": "Settings — Pulse HR",
  "/announcements": "Announcements — Pulse HR",
  "/kudos": "Kudos — Pulse HR",
  "/focus": "Focus Mode — Pulse HR",
  "/feedback": "Feedback — Pulse",
  "/welcome": "Welcome — Pulse HR",
  "/admin/modules": "Modules — Pulse HR",
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
    const t = TITLE_BY_PATH[location.pathname] ?? "Pulse HR";
    if (typeof document !== "undefined") document.title = t;
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
