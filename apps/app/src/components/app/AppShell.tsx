import { useClerk, useUser } from "@clerk/react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSidebarFeatures } from "@/components/app/SidebarFeaturesContext";
import { SidebarRouteGuard } from "@/components/app/SidebarRouteGuard";
import { CommentPill } from "@/components/comments/CommentPill";
import { CommentsOverlayProvider } from "@/components/comments/CommentsOverlayProvider";
import { PinLayer } from "@/components/comments/PinLayer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTrackPageViews } from "@/lib/usage-tracking";
import { voiceBus } from "@/lib/voice-bus";
import { ActiveCommessaPin } from "./ActiveCommessaPin";
import { BookingDialog } from "./BookingDialog";
import { BookingsProvider } from "./BookingsContext";
import { CommandPalette } from "./CommandPalette";
import { LogOverlay } from "./LogOverlay";
import { NewBadge } from "./NewBadge";
import { OfficesStoreProvider } from "./OfficesStoreProvider";
import { QuickActionProvider, useQuickAction } from "./QuickActions";
import { ShortcutSheet } from "./ShortcutSheet";
import { ChangelogGate } from "./ChangelogGate";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { TourLauncher } from "./TourLauncher";
import { TourProvider } from "./TourProvider";
import { VoiceDock } from "./VoiceDock";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  OVERRIDE_ROLES,
  useEffectiveRole,
  useIsEffectiveAdmin,
  useIsRealAdmin,
  useRoleOverride,
} from "@/lib/role-override";
import { featuresForRole } from "@/lib/role-features";
import { managerAsks } from "@/lib/mock-data";
import { NotificationsProvider, useNotifications } from "./NotificationsContext";
import { buildSidebarNavGroups } from "@/lib/sidebar-nav-groups";
import { cn } from "@/lib/utils";
import { resetWorkspace, useWorkspaceStatus } from "@/lib/workspace";

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
  const effectiveRole = useEffectiveRole();
  const { isFeatureEnabled, roleFeatures } = useSidebarFeatures();
  const roleAllowed = useMemo(
    () => featuresForRole(effectiveRole, roleFeatures),
    [effectiveRole, roleFeatures],
  );
  const hasOpenManagerAsks = useMemo(() => managerAsks.some((a) => a.status === "pending"), []);
  const groups = useMemo(() => {
    const raw = buildSidebarNavGroups(hasOpenManagerAsks, admin);
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
  }, [hasOpenManagerAsks, admin, roleAllowed, isFeatureEnabled]);
  useTrackPageViews();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const workspace = useWorkspaceStatus();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        appShellNav({ to: "/moments" });
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
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar — desktop only */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-sidebar transition-[width] duration-200 shrink-0",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        <div className="h-14 flex items-center gap-2 px-3 border-b">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm font-semibold hover:bg-sidebar-accent rounded-md px-1.5 py-1 -ml-1 min-w-0">
                  <span className="truncate">{workspace.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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

        <nav data-tour="sidebar-nav" className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
          {groups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <div className="px-2 mb-1 text-[11px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1.5">
                  {group.label}
                  {group.accent && (
                    <span className="inline-block h-1 w-1 rounded-full bg-primary pulse-dot" />
                  )}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      id={item.to === "/focus" ? "nav-focus" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors relative",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                        collapsed && "justify-center",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!collapsed && item.isNew && (
                        <span className="accent-dot pulse-dot" aria-label="New" />
                      )}
                      {!collapsed && item.unreadDot && !item.isNew && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot"
                          aria-label="Open asks"
                        />
                      )}
                      {collapsed && (item.isNew || item.unreadDot) && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t p-2">
          <TourLauncher collapsed={collapsed} />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenLog={() => setLogOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          showFeedbackLink={admin || isFeatureEnabled("feedback")}
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

      {/* Mobile nav drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-[84%] max-w-[300px] bg-sidebar">
          <div className="h-14 flex items-center gap-2 px-3 border-b">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">{workspace.name}</span>
          </div>
          <div className="px-3 py-3 border-b">
            <ThemeSwitcher />
          </div>
          <nav className="overflow-y-auto scrollbar-thin py-3 px-2 h-[calc(100%-6.75rem)]">
            {groups.map((group) => (
              <div key={group.label} className="mb-4">
                <div className="px-2 mb-1 text-[11px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1.5">
                  {group.label}
                  {group.accent && (
                    <span className="inline-block h-1 w-1 rounded-full bg-primary pulse-dot" />
                  )}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      item.to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.to);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.isNew && <span className="accent-dot pulse-dot" aria-label="New" />}
                        {item.unreadDot && !item.isNew && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot"
                            aria-label="Open asks"
                          />
                        )}
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

function Topbar({
  onOpenPalette,
  onOpenLog,
  onOpenMobileNav,
  showFeedbackLink,
}: {
  onOpenPalette: () => void;
  onOpenLog: () => void;
  onOpenMobileNav: () => void;
  showFeedbackLink: boolean;
}) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { pathname } = useLocation();
  const showCommessaPin = ["/focus", "/time", "/forecast"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const navigate = useNavigate();
  const { open: openAction } = useQuickAction();
  const { user } = useUser();
  const { signOut } = useClerk();
  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Signed in";
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const effectiveRole = useEffectiveRole();
  const displayRole = effectiveRole
    ? effectiveRole.charAt(0).toUpperCase() + effectiveRole.slice(1)
    : "";
  const isAdmin = useIsEffectiveAdmin();
  const isRealAdmin = useIsRealAdmin();
  const { override, setOverride } = useRoleOverride();
  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") ||
    displayName.slice(0, 2).toUpperCase();
  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };
  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur flex items-center px-3 md:px-4 gap-2 md:gap-3 shrink-0">
      <button
        onClick={onOpenMobileNav}
        className="lg:hidden h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center shrink-0"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        data-tour="topbar-search"
        onClick={onOpenPalette}
        className="relative flex-1 max-w-2xl text-left flex items-center h-9 px-3 rounded-md bg-muted/50 hover:bg-muted text-sm text-muted-foreground min-w-0"
      >
        <Search className="h-4 w-4 mr-2 shrink-0" />
        <span className="truncate">
          <span className="hidden sm:inline">Search employees, documents, requests…</span>
          <span className="sm:hidden">Search…</span>
        </span>
        <kbd className="hidden md:inline-flex ml-auto h-5 px-1.5 items-center rounded border bg-background text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      {showCommessaPin && (
        <div data-tour="topbar-commessa-pin" className="hidden lg:inline-flex">
          <ActiveCommessaPin />
        </div>
      )}
      {showFeedbackLink && (
        <Link
          to="/feedback"
          className="hidden lg:inline-flex h-9 items-center gap-1.5 px-2.5 rounded-md border bg-background/80 hover:bg-muted text-sm press-scale transition-colors"
          title="Feedback board"
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="hidden xl:inline font-medium">Feedback</span>
        </Link>
      )}
      <div data-tour="topbar-status-log" className="hidden md:inline-flex">
        <button
          onClick={onOpenLog}
          className="group relative inline-flex items-center gap-2 h-9 px-3 rounded-md border bg-background/80 hover:bg-muted text-sm press-scale"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium">Status Log</span>
          <NewBadge />
          <kbd className="hidden md:inline-flex h-5 px-1.5 items-center rounded border bg-muted text-[10px] font-mono">
            ⌘J
          </kbd>
        </button>
      </div>
      <button
        onClick={onOpenLog}
        className="md:hidden h-9 w-9 rounded-md border bg-background/80 hover:bg-muted flex items-center justify-center"
        aria-label="Status Log"
      >
        <Sparkles className="h-4 w-4 text-primary" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button data-tour="topbar-new" size="sm" className="h-9 gap-1.5 px-2.5 md:px-3">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">New</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => openAction("add-employee")}>
            <Users className="h-4 w-4 mr-2" />
            Add employee
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openAction("request-leave")}>
            <Calendar className="h-4 w-4 mr-2" />
            Request leave
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openAction("submit-expense")}>
            <Receipt className="h-4 w-4 mr-2" />
            Submit expense
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openAction("post-job")}>
            <Briefcase className="h-4 w-4 mr-2" />
            Post a job
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              toast.success("Automation triggered", {
                description: "Running 'Sync new hires to Slack'",
              })
            }
          >
            <Zap className="h-4 w-4 mr-2" />
            Run automation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden md:block">
        <ThemeSwitcher compact />
      </div>

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
                        n.kind === "release" && "bg-primary",
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-md hover:bg-muted">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className={cn(
                  "h-7 w-7 rounded-full object-cover",
                  isAdmin && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              />
            ) : (
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-medium",
                  isAdmin && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: "oklch(0.6 0.16 220)" }}
              >
                {initials.toUpperCase().slice(0, 2) || "?"}
              </div>
            )}
            <div className="hidden md:block text-left max-w-[140px]">
              <div className="text-xs font-medium leading-tight truncate">{displayName}</div>
              <div className="text-[10px] text-muted-foreground leading-tight truncate">
                {displayRole || displayEmail || "Pulse HR workspace"}
              </div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          {isRealAdmin && (
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
                    toast.success("Back to admin view");
                  }}
                >
                  <span className="flex-1">Admin</span>
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
                    {override === r && (
                      <span className="text-xs text-muted-foreground">current</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div data-tour="page-header" className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

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
  color,
  size = 32,
  employeeId,
}: {
  initials: string;
  color: string;
  size?: number;
  /** When provided, the avatar becomes a hover card trigger with a mini profile. */
  employeeId?: string;
}) {
  const visual = (
    <div
      className="rounded-full flex items-center justify-center font-medium shrink-0 text-[color:var(--avatar-ink)]"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
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
