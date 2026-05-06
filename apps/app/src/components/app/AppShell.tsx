import { useAuth, useClerk, useUser } from "@clerk/react";
import { useLoginWall } from "@/components/app/LoginWall";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useSidebarFeatures } from "@/components/app/SidebarFeaturesContext";
import { SidebarRouteGuard } from "@/components/app/SidebarRouteGuard";
import { CommentPill } from "@/components/comments/CommentPill";
import {
  CommentsOverlayProvider,
  useCommentsOverlay,
} from "@/components/comments/CommentsOverlayProvider";
import { useNewProposal } from "@/components/proposals/ProposalProvider";
import { PinLayer } from "@/components/comments/PinLayer";
import { Sheet, SheetContent } from "@pulse-hr/ui/primitives/sheet";
import { useTrackPageViews } from "@/lib/usage-tracking";
import { APP_VERSION } from "@/lib/version";
import { voiceBus } from "@/lib/voice-bus";
import { BookingDialog } from "./BookingDialog";
import { BookingsProvider } from "./BookingsContext";
import { CommandPalette } from "./CommandPalette";
import { LogOverlay } from "./LogOverlay";
import { DemoBanner } from "./DemoBanner";
import { OfflineBanner } from "./OfflineBanner";
import { BrandMark } from "@pulse-hr/ui/atoms/BrandMark";
import { NewBadge } from "@pulse-hr/ui/atoms/NewBadge";
import { OfficesStoreProvider } from "./OfficesStoreProvider";
import { QuickActionProvider, useQuickAction } from "./QuickActions";
import { ShortcutSheet } from "./ShortcutSheet";
import { ChangelogGate } from "./ChangelogGate";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { TourLauncher } from "./TourLauncher";
import { TourProvider } from "./TourProvider";
import { VoiceDock } from "./VoiceDock";
import { VotingPowerChip } from "./VotingPowerChip";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  Zap,
  Bell,
  Eye,
  EyeOff,
  Megaphone,
  MessagesSquare,
  Gift,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { EmployeeHoverCard } from "@/components/score/EmployeeHoverCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { Badge } from "@pulse-hr/ui/primitives/badge";
import { Button } from "@pulse-hr/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@pulse-hr/ui/primitives/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@pulse-hr/ui/primitives/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@pulse-hr/ui/primitives/tooltip";
import {
  OVERRIDE_ROLES,
  useEffectiveRole,
  useIsEffectiveAdmin,
  useIsRealAdmin,
  useRoleOverride,
  useWorkspacePersona,
} from "@/lib/role-override";
import { featuresForRole } from "@/lib/role-features";
import { managerAsks } from "@/lib/mock-data";
import { NotificationsProvider, useNotifications } from "./NotificationsContext";
import { buildSidebarNavGroups } from "@/lib/sidebar-nav-groups";
import { cn } from "@/lib/utils";
import { resetWorkspace, useWorkspaceStatus } from "@/lib/workspace";

const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? "https://feedback.pulsehr.it";
const SIDEBAR_COLLAPSED_KEY = "pulse.sidebarCollapsed.v1";

type QuickActionEntry =
  | { kind: "action"; id: "add-employee" | "request-leave" | "submit-expense" | "post-job" | "run-payroll"; label: string; icon: LucideIcon }
  | { kind: "nav"; to: string; label: string; icon: LucideIcon }
  | { kind: "automation"; label: string; icon: LucideIcon; description: string };

const QUICK_ACTIONS_BY_ROLE: Record<string, QuickActionEntry[]> = {
  employee: [
    { kind: "action", id: "request-leave", label: "Request leave", icon: Calendar },
    { kind: "action", id: "submit-expense", label: "Submit expense", icon: Receipt },
    { kind: "nav", to: "/log", label: "Log status", icon: MessagesSquare },
    { kind: "nav", to: "/kudos", label: "Give kudos", icon: Gift },
  ],
  manager: [
    { kind: "action", id: "request-leave", label: "Request leave", icon: Calendar },
    { kind: "action", id: "submit-expense", label: "Submit expense", icon: Receipt },
    { kind: "nav", to: "/leave", label: "Review approvals", icon: Users },
    { kind: "nav", to: "/kudos", label: "Give kudos", icon: Gift },
  ],
  hr: [
    { kind: "action", id: "post-job", label: "Post a job", icon: Briefcase },
    { kind: "action", id: "add-employee", label: "Add employee", icon: Users },
    { kind: "nav", to: "/announcements", label: "New announcement", icon: Megaphone },
    { kind: "action", id: "request-leave", label: "Request leave", icon: Calendar },
  ],
  finance: [
    { kind: "action", id: "submit-expense", label: "Submit expense", icon: Receipt },
    { kind: "nav", to: "/reports", label: "Open reports", icon: BarChart3 },
    { kind: "action", id: "request-leave", label: "Request leave", icon: Calendar },
  ],
  admin: [
    { kind: "action", id: "post-job", label: "Post a job", icon: Briefcase },
    { kind: "action", id: "add-employee", label: "Add employee", icon: Users },
    { kind: "nav", to: "/announcements", label: "New announcement", icon: Megaphone },
    {
      kind: "automation",
      label: "Run automation",
      icon: Zap,
      description: "Sync new hires to Slack",
    },
  ],
};

function quickActionsForRole(role: string): QuickActionEntry[] {
  return QUICK_ACTIONS_BY_ROLE[role] ?? QUICK_ACTIONS_BY_ROLE.employee;
}

export function AppShell() {
  return (
    <OfficesStoreProvider>
      <BookingsProvider>
        <QuickActionProvider>
          <CommentsOverlayProvider>
            <NotificationsProvider>
              <TourProvider>
                <AppShellInner />
              </TourProvider>
            </NotificationsProvider>
          </CommentsOverlayProvider>
        </QuickActionProvider>
      </BookingsProvider>
    </OfficesStoreProvider>
  );
}

function AppShellInner() {
  const location = useLocation();
  const appShellNav = useNavigate();
  const admin = useIsEffectiveAdmin();
  const realAdmin = useIsRealAdmin();
  const effectiveRole = useEffectiveRole();
  const { isFeatureEnabled, roleFeatures } = useSidebarFeatures();
  const roleAllowed = useMemo(
    () => featuresForRole(effectiveRole, roleFeatures),
    [effectiveRole, roleFeatures],
  );
  const hasOpenManagerAsks = useMemo(() => managerAsks.some((a) => a.status === "pending"), []);
  const groups = useMemo(() => {
    const raw = buildSidebarNavGroups(hasOpenManagerAsks, realAdmin);
    return raw
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          if (!item.featureId) return true;
          if (!admin && !roleAllowed.has(item.featureId)) return false;
          return admin || isFeatureEnabled(item.featureId);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [hasOpenManagerAsks, realAdmin, admin, roleAllowed, isFeatureEnabled]);
  useTrackPageViews();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const workspace = useWorkspaceStatus();
  const { open: openProposal } = useNewProposal();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handlersRef = useRef({ openProposal, appShellNav });
  handlersRef.current = { openProposal, appShellNav };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "j") {
        e.preventDefault();
        setLogOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "." || e.code === "Period")) {
        e.preventDefault();
        voiceBus.emit({ kind: "toggle" });
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        handlersRef.current.openProposal();
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        handlersRef.current.appShellNav({ to: "/moments" });
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setBookingOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return voiceBus.on((ev) => {
      if (ev.kind === "draftPrompt" && ev.source === "log") setLogOpen(true);
    });
  }, []);

  return (
    <div
      className="flex h-screen w-full bg-background text-foreground overflow-hidden"
      style={{ ["--topbar-height" as string]: "3.5rem" }}
    >
      {/* Sidebar — desktop only · Editorial */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r transition-[width] duration-200 shrink-0",
          collapsed ? "w-[64px]" : "w-[220px]",
        )}
        style={{ borderColor: "var(--line)", background: "var(--bg)" }}
      >
        <div
          className="h-14 flex items-center gap-2 px-4"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <BrandMark size="md" wordmark={!collapsed} />
          {!collapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground rounded-md px-1.5 py-1 min-w-0">
                  <span className="truncate">{workspace.name}</span>
                  <ChevronDown className="h-3 w-3 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                <DropdownMenuItem disabled>
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="truncate">{workspace.name}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onSelect={(e) => {
                    e.preventDefault();
                    setConfirmReset(true);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <TooltipProvider delayDuration={200} skipDelayDuration={100}>
          <nav
            data-tour="sidebar-nav"
            className="flex-1 overflow-y-auto scroll-fade py-5 px-3"
            style={{ ["--fade-bg" as string]: "var(--bg)" }}
          >
            {groups.map((group) => (
              <div key={group.label} className="mb-6">
                {!collapsed && (
                  <div className="px-2 mb-2 t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {group.label}
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    if (item.kind === "tours") {
                      return <TourLauncher key="tours" collapsed={collapsed} />;
                    }
                    const active = item.external
                      ? false
                      : item.to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.to);
                    const Icon = item.icon;
                    const className = cn(
                      "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors relative",
                      active ? "font-semibold" : "hover:bg-muted/40",
                      collapsed && "justify-center",
                    );
                    const linkStyle = active
                      ? {
                          color: "var(--bg)",
                          background: "var(--fg)",
                          boxShadow: "inset 3px 0 0 0 var(--spark)",
                        }
                      : { color: "var(--muted-foreground)" };
                    const inner = (
                      <>
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                        {!collapsed && active && <span className="dot" aria-hidden />}
                        {!collapsed && !active && item.unreadDot && (
                          <span
                            className="h-1.5 w-1.5 rounded-full pulse-dot"
                            style={{ background: "var(--spark)" }}
                            aria-label="Unread"
                          />
                        )}
                        {collapsed && item.unreadDot && (
                          <span
                            className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full pulse-dot"
                            style={{ background: "var(--spark)" }}
                          />
                        )}
                      </>
                    );
                    const node = item.external ? (
                      <a href={item.to} className={className} style={linkStyle}>
                        {inner}
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        id={item.to === "/focus" ? "nav-focus" : undefined}
                        className={className}
                        style={linkStyle}
                      >
                        {inner}
                      </Link>
                    );
                    return (
                      <SidebarTooltip key={item.to} label={item.label} enabled={collapsed}>
                        {node}
                      </SidebarTooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>

        <div className="p-3 space-y-2" style={{ borderTop: "1px solid var(--line)" }}>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm hover:bg-muted/40 transition-colors",
              collapsed && "justify-center",
            )}
            style={{ color: "var(--muted-foreground)" }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1 text-left">Collapse</span>
              </>
            )}
          </button>
          <div
            className={cn(
              "t-mono-sm flex items-center gap-1.5 select-none",
              collapsed && "justify-center",
            )}
            style={{ color: "var(--muted-foreground)", padding: collapsed ? 0 : "0 8px" }}
            title={`Pulse HR build v${APP_VERSION}`}
          >
            <span className="dot" aria-hidden />
            {!collapsed && <span>v{APP_VERSION} · LIVE</span>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner />
        <OfflineBanner />
        <Topbar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenLog={() => setLogOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          // Always offer the Feedback entry-point. When the visitor is
          // anonymous, the link opens the LoginWall instead of leaving the app.
          showFeedbackLink
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <SidebarRouteGuard>
            <Outlet />
          </SidebarRouteGuard>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <LogOverlay open={logOpen} onOpenChange={setLogOpen} />
      <ShortcutSheet />
      <VoiceDock />
      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <PinLayer />
      <CommentPill />
      <ChangelogGate />

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset this workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Every employee, project, request, comment, and counter you've touched will be cleared.
              You'll be returned to the welcome flow to seed a fresh demo. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                resetWorkspace();
                setConfirmReset(false);
                toast.success("Workspace reset");
                appShellNav({ to: "/welcome", replace: true });
              }}
            >
              Reset workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile nav drawer · Editorial */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="p-0 w-[84%] max-w-[300px]"
          style={{ background: "var(--bg)" }}
        >
          <div
            className="h-14 flex items-center gap-2 px-4"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <BrandMark size="md" wordmark={!collapsed} />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {workspace.name}
            </span>
          </div>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
            <ThemeSwitcher />
          </div>
          <nav
            className="overflow-y-auto scroll-fade py-5 px-3 h-[calc(100%-6.75rem)]"
            style={{ ["--fade-bg" as string]: "var(--bg)" }}
          >
            {groups.map((group) => (
              <div key={group.label} className="mb-6">
                <div className="px-2 mb-2 t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    if (item.kind === "tours") {
                      return <TourLauncher key="tours" collapsed={false} />;
                    }
                    const active = item.external
                      ? false
                      : item.to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.to);
                    const Icon = item.icon;
                    const className = cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors relative",
                      active ? "font-semibold" : "hover:bg-muted/40",
                    );
                    const linkStyle = active
                      ? {
                          color: "var(--bg)",
                          background: "var(--fg)",
                          boxShadow: "inset 3px 0 0 0 var(--spark)",
                        }
                      : { color: "var(--muted-foreground)" };
                    const inner = (
                      <>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.unreadDot && (
                          <span
                            className="h-1.5 w-1.5 rounded-full pulse-dot"
                            style={{ background: "var(--spark)" }}
                            aria-label="Unread"
                          />
                        )}
                      </>
                    );
                    if (item.external) {
                      return (
                        <a key={item.to} href={item.to} className={className} style={linkStyle}>
                          {inner}
                        </a>
                      );
                    }
                    return (
                      <Link key={item.to} to={item.to} className={className} style={linkStyle}>
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SidebarTooltip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function FeedbackLink() {
  const { isSignedIn } = useAuth();
  const { require } = useLoginWall();
  const className =
    "hidden lg:inline-flex h-9 items-center gap-1.5 px-2.5 rounded-md border bg-background/80 hover:bg-muted text-sm press-scale transition-colors";
  if (!isSignedIn) {
    return (
      <button
        type="button"
        onClick={() => require("feedback")}
        className={className}
        title="Sign in to share feedback"
      >
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="hidden xl:inline font-medium">Feedback</span>
      </button>
    );
  }
  return (
    <a href={FEEDBACK_URL} className={className} title="Feedback board">
      <MessageSquare className="h-4 w-4 text-muted-foreground" />
      <span className="hidden xl:inline font-medium">Feedback</span>
    </a>
  );
}

function CommentsVisibilityToggle() {
  const { visible, toggleVisibility } = useCommentsOverlay();
  const Icon = visible ? Eye : EyeOff;
  return (
    <button
      type="button"
      onClick={toggleVisibility}
      className={cn(
        "hidden md:inline-flex h-9 w-9 rounded-md border bg-background/80 hover:bg-muted items-center justify-center press-scale transition-colors",
        !visible && "text-muted-foreground",
      )}
      aria-pressed={!visible}
      aria-label={visible ? "Hide comments" : "Show comments"}
      title={visible ? "Hide comments" : "Show comments"}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

const SECTION_BY_PATH: Record<string, string> = {
  "/": "DASHBOARD",
  "/people": "PERSONE",
  "/onboarding": "ONBOARDING",
  "/kudos": "KUDOS",
  "/log": "STATUS LOG",
  "/growth": "GROWTH",
  "/time": "TIMESHEET",
  "/projects": "COMMESSE",
  "/clients": "CLIENTI",
  "/forecast": "FORECAST",
  "/focus": "FOCUS",
  "/activities": "ACTIVITIES",
  "/calendar": "CALENDAR",
  "/leave": "LEAVE",
  "/documents": "DOCUMENTS",
  "/offices": "OFFICES",
  "/payroll": "PAYROLL",
  "/expenses": "SPESE",
  "/reports": "REPORTS",
  "/saturation": "SATURAZIONE",
  "/settings": "SETTINGS",
  "/profile": "PROFILE",
  "/welcome": "WELCOME",
  "/marketplace": "MARKETPLACE",
  "/developers": "DEVELOPERS",
  "/docs": "DOCS",
  "/announcements": "ANNOUNCEMENTS",
  "/recruiting": "RECRUITING",
  "/org": "ORG CHART",
  "/moments": "MOMENTI",
};

function sectionForPath(pathname: string): string {
  for (const key of Object.keys(SECTION_BY_PATH).sort((a, b) => b.length - a.length)) {
    if (key === "/") continue;
    if (pathname === key || pathname.startsWith(key + "/")) return SECTION_BY_PATH[key];
  }
  return SECTION_BY_PATH["/"];
}

function Topbar({
  onOpenPalette,
  onOpenLog,
  onOpenMobileNav,
}: {
  onOpenPalette: () => void;
  onOpenLog: () => void;
  onOpenMobileNav: () => void;
  /** Kept for API compat; feedback link now lives in the avatar menu. */
  showFeedbackLink?: boolean;
}) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const { open: openAction } = useQuickAction();
  const location = useLocation();
  const section = sectionForPath(location.pathname);
  const { isSignedIn: signedInForFeedback } = useAuth();
  const { require: requireLogin } = useLoginWall();
  const { visible: commentsVisible, toggleVisibility: toggleComments } = useCommentsOverlay();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Signed in";
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const effectiveRole = useEffectiveRole();
  const workspacePersona = useWorkspacePersona();
  const displayRole = effectiveRole
    ? effectiveRole.charAt(0).toUpperCase() + effectiveRole.slice(1)
    : "";
  const isAdmin = useIsEffectiveAdmin();
  const { override, setOverride } = useRoleOverride();
  const savedRoleLabel =
    workspacePersona.charAt(0).toUpperCase() + workspacePersona.slice(1);
  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") ||
    displayName.slice(0, 2).toUpperCase();
  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", search: {}, replace: true });
  };
  return (
    <header
      className="h-14 flex items-center px-4 md:px-6 gap-3 shrink-0"
      style={{
        borderBottom: "1px solid var(--line)",
        background: "color-mix(in oklch, var(--bg) 80%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <button
        onClick={onOpenMobileNav}
        className="lg:hidden h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center shrink-0"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <span
        className="t-mono shrink-0 hidden sm:inline"
        style={{ color: "var(--muted-foreground)" }}
      >
        {section}
      </span>

      <div className="flex-1" />

      <button
        data-tour="topbar-search"
        onClick={onOpenPalette}
        className="pill pill-ghost pill-sm hidden md:inline-flex"
        style={{ color: "var(--muted-foreground)" }}
      >
        <Search className="h-3.5 w-3.5" />
        <span>⌘K · CERCA</span>
      </button>
      <button
        onClick={onOpenPalette}
        className="md:hidden h-9 w-9 rounded-md border flex items-center justify-center"
        style={{ borderColor: "var(--line-strong)" }}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      <button
        data-tour="topbar-status-log"
        onClick={onOpenLog}
        className="pill pill-spark pill-sm hidden sm:inline-flex"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>⌘J Copilot</span>
      </button>
      <button
        onClick={onOpenLog}
        className="sm:hidden h-9 w-9 rounded-full pill-spark flex items-center justify-center"
        style={{
          background: "var(--spark)",
          color: "var(--spark-ink)",
          padding: 0,
        }}
        aria-label="Copilot"
      >
        <Sparkles className="h-4 w-4" />
      </button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            data-tour="topbar-notifications"
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-semibold text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => {
                void markAllRead();
                toast.success("All notifications marked as read");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                You're all caught up.
              </div>
            )}
            {notifications.map((n) => {
              const unread = !n.readAt;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    void markRead(n.id);
                    if (n.link) navigate({ to: n.link });
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50",
                    unread && "bg-info/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-2 w-2 mt-1.5 rounded-full shrink-0",
                        n.kind === "release" && "bg-success",
                        n.kind === "mention" && "bg-warning",
                        n.kind.startsWith("comment.") && "bg-info",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.body}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {formatRelativeTime(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {!isSignedIn ? (
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-3 gap-1.5"
          onClick={() => navigate({ to: "/login", search: {} })}
        >
          <span className="font-medium">Log in</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-full hover:bg-muted/40">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className={cn("h-7 w-7 rounded-full object-cover", isAdmin && "ring-1 ring-border")}
                />
              ) : (
                <span className={cn("ph-avatar ph-avatar-sm", isAdmin && "ring-1 ring-border")}>
                  {initials.toUpperCase().slice(0, 2) || "?"}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="truncate">
              <div className="text-sm font-semibold truncate">{displayName}</div>
              <div className="text-[11px] font-normal text-muted-foreground truncate">
                {displayRole || displayEmail || "Pulse HR workspace"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleComments(); }}>
              {commentsVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {commentsVisible ? "Hide comments" : "Show comments"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                if (!signedInForFeedback) {
                  requireLogin("feedback");
                  return;
                }
                window.open(FEEDBACK_URL, "_blank");
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback board
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                navigate({ to: "/moments" });
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Moments
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                openAction("add-employee");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick action…
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span className="flex-1">Switch role</span>
                {override && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {override}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  View as
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={() => {
                    setOverride(null);
                    toast.success(`Showing as ${savedRoleLabel}`, {
                      description: "Your saved workspace role.",
                    });
                  }}
                >
                  <span className="flex-1">{savedRoleLabel}</span>
                  {!override && <span className="text-xs text-muted-foreground">current</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {OVERRIDE_ROLES.map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onSelect={() => {
                      setOverride(r);
                      toast.success(`Viewing as ${r}`, {
                        description: "You can switch back any time.",
                      });
                    }}
                  >
                    <span className="flex-1 capitalize">{r}</span>
                    {effectiveRole === r && (
                      <span className="text-xs text-muted-foreground">current</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <div className="px-2 py-1.5 flex items-center justify-between gap-2">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                THEME
              </span>
              <ThemeSwitcher compact />
            </div>
            <div className="px-2 pb-1.5 flex items-center justify-between gap-2">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                VOTING POWER
              </span>
              <VotingPowerChip />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}

// PageHeader moved to @pulse-hr/ui/atoms/PageHeader. Re-exported from AppShell
// for back-compat with in-flight branches that still import from here.
export { PageHeader } from "@pulse-hr/ui/atoms/PageHeader";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-success/10 text-success border-success/20" },
    on_leave: { label: "On leave", cls: "bg-warning/10 text-warning border-warning/30" },
    remote: { label: "Remote", cls: "bg-info/10 text-info border-info/20" },
    offboarding: { label: "Offboarding", cls: "bg-muted text-muted-foreground border-border" },
    pending: { label: "Pending", cls: "bg-warning/10 text-warning border-warning/30" },
    approved: { label: "Approved", cls: "bg-success/10 text-success border-success/20" },
    rejected: {
      label: "Rejected",
      cls: "bg-destructive/10 text-destructive border-destructive/20",
    },
    reimbursed: { label: "Reimbursed", cls: "bg-success/10 text-success border-success/20" },
    completed: { label: "Completed", cls: "bg-success/10 text-success border-success/20" },
    processing: { label: "Processing", cls: "bg-info/10 text-info border-info/20" },
    scheduled: { label: "Scheduled", cls: "bg-info/10 text-info border-info/20" },
    draft: { label: "Draft", cls: "bg-muted text-muted-foreground border-border" },
    // Day statuses (calendar)
    filled: { label: "Filled", cls: "bg-success/10 text-success border-success/20" },
    partial: { label: "Partial", cls: "bg-warning/10 text-warning border-warning/30" },
    missing: { label: "Missing", cls: "bg-destructive/10 text-destructive border-destructive/20" },
    sick: { label: "Sick", cls: "bg-cal-sick/15 text-cal-sick border-cal-sick/30" },
    vacation: {
      label: "Vacation",
      cls: "bg-cal-vacation/15 text-cal-vacation border-cal-vacation/30",
    },
    personal: {
      label: "Personal",
      cls: "bg-cal-personal/15 text-cal-personal border-cal-personal/30",
    },
    parental: {
      label: "Parental",
      cls: "bg-cal-parental/15 text-cal-parental border-cal-parental/30",
    },
    holiday: { label: "Holiday", cls: "bg-cal-holiday/15 text-cal-holiday border-cal-holiday/30" },
    weekend: { label: "Weekend", cls: "bg-muted/50 text-muted-foreground border-border" },
    future: { label: "Upcoming", cls: "bg-muted/30 text-muted-foreground border-border" },
    day_off: { label: "Day off", cls: "bg-muted/50 text-muted-foreground border-border" },
    // Project + activity statuses
    on_hold: { label: "On hold", cls: "bg-warning/10 text-warning border-warning/30" },
    closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
    at_risk: { label: "At risk", cls: "bg-destructive/10 text-destructive border-destructive/20" },
    done: { label: "Done", cls: "bg-success/10 text-success border-success/20" },
    todo: { label: "To do", cls: "bg-muted text-muted-foreground border-border" },
    in_progress: { label: "In progress", cls: "bg-info/10 text-info border-info/20" },
    review: { label: "Review", cls: "bg-warning/10 text-warning border-warning/30" },
    blocked: { label: "Blocked", cls: "bg-destructive/10 text-destructive border-destructive/20" },
    connected: { label: "Connected", cls: "bg-success/10 text-success border-success/20" },
    disconnected: { label: "Disconnected", cls: "bg-muted text-muted-foreground border-border" },
    error: { label: "Error", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cn("font-medium", m.cls)}>
      {m.label}
    </Badge>
  );
}

export function Avatar({
  initials,
  // Tinted per-user colour preserved for callers that pass it (e.g. mock data).
  // Editorial mode ignores it and uses ink/paper inversion for visual cohesion.
  color: _color,
  size = 32,
  employeeId,
}: {
  initials: string;
  color?: string;
  size?: number;
  /** When provided, the avatar becomes a hover card trigger with a mini profile. */
  employeeId?: string;
}) {
  void _color;
  const visual = (
    <span
      className="ph-avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize: Math.max(8, size * 0.36),
      }}
    >
      {initials}
    </span>
  );
  if (!employeeId) return visual;
  return <EmployeeHoverCard employeeId={employeeId}>{visual}</EmployeeHoverCard>;
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
