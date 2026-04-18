import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { QuickActionProvider, useQuickAction } from "./QuickActions";
import { CommandPalette } from "./CommandPalette";
import { CopilotLauncher, CopilotOverlay } from "./Copilot";
import { NewBadge } from "./NewBadge";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ActiveCommessaPin } from "./ActiveCommessaPin";
import { ShortcutSheet } from "./ShortcutSheet";
import { VoiceDock } from "./VoiceDock";
import { voiceBus } from "@/lib/voice-bus";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Wallet,
  BarChart3,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Building2,
  Sparkles,
  LifeBuoy,
  Clock,
  Calendar,
  FileText,
  Receipt,
  CreditCard,
  Network,
  GraduationCap,
  Megaphone,
  Puzzle,
  Code2,
  ShieldCheck,
  Languages,
  BookOpen,
  Zap,
  Heart,
  TrendingUp,
  Gift,
  Focus,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { notifications } from "@/lib/mock-data";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
};
type NavGroup = { label: string; items: NavItem[]; accent?: boolean };

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/announcements", label: "Announcements", icon: Megaphone },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/people", label: "Employees", icon: Users },
      { to: "/org", label: "Org chart", icon: Network },
      { to: "/recruiting", label: "Recruiting", icon: Briefcase },
      { to: "/onboarding", label: "Onboarding", icon: GraduationCap },
    ],
  },
  {
    label: "Work",
    items: [
      { to: "/time", label: "Time & attendance", icon: Clock },
      { to: "/leave", label: "Leave", icon: Calendar },
      { to: "/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    label: "Money",
    items: [
      { to: "/payroll", label: "Payroll", icon: CreditCard },
      { to: "/expenses", label: "Expenses", icon: Receipt },
    ],
  },
  {
    label: "Insights",
    items: [{ to: "/reports", label: "Reports", icon: BarChart3 }],
  },
  {
    label: "Growth",
    accent: true,
    items: [{ to: "/growth", label: "Growth", icon: Trophy, isNew: true }],
  },
  {
    label: "Labs",
    accent: true,
    items: [
      { to: "/pulse", label: "Team Pulse", icon: Heart, isNew: true },
      { to: "/forecast", label: "Commessa Forecast", icon: TrendingUp, isNew: true },
      { to: "/kudos", label: "Kudos", icon: Gift, isNew: true },
      { to: "/focus", label: "Focus Mode", icon: Focus, isNew: true },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/marketplace", label: "Marketplace", icon: Puzzle },
      { to: "/developers", label: "Developers", icon: Code2 },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell() {
  return (
    <QuickActionProvider>
      <AppShellInner />
    </QuickActionProvider>
  );
}

function AppShellInner() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        setCopilotOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "." || e.code === "Period")) {
        e.preventDefault();
        voiceBus.emit({ kind: "toggle" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return voiceBus.on((ev) => {
      if (ev.kind === "draftPrompt") setCopilotOpen(true);
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
                <button className="flex items-center gap-1.5 text-sm font-semibold hover:bg-sidebar-accent rounded-md px-1.5 py-1 -ml-1">
                  Acme Inc.
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Building2 className="h-4 w-4 mr-2" />
                  Acme Inc.
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="h-4 w-4 mr-2" />
                  Acme EU
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="h-4 w-4 mr-2" />
                  New workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
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
                      {!collapsed && item.isNew && <NewBadge />}
                      {collapsed && item.isNew && (
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
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent/60"
          >
            <LifeBuoy className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Help & support</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenCopilot={() => setCopilotOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <CopilotOverlay open={copilotOpen} onOpenChange={setCopilotOpen} />
      <ShortcutSheet />
      <VoiceDock />

      {/* Mobile nav drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-[84%] max-w-[300px] bg-sidebar">
          <div className="h-14 flex items-center gap-2 px-3 border-b">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Acme Inc.</span>
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
                        {item.isNew && <NewBadge />}
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
  onOpenCopilot,
  onOpenMobileNav,
}: {
  onOpenPalette: () => void;
  onOpenCopilot: () => void;
  onOpenMobileNav: () => void;
}) {
  const unread = notifications.filter((n) => n.unread).length;
  const navigate = useNavigate();
  const { open: openAction } = useQuickAction();
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
        onClick={onOpenPalette}
        className="relative flex-1 max-w-xl text-left flex items-center h-9 px-3 rounded-md bg-muted/50 hover:bg-muted text-sm text-muted-foreground min-w-0"
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

      <div className="hidden md:block flex-1" />

      <div className="hidden lg:inline-flex">
        <ActiveCommessaPin />
      </div>
      <div className="hidden md:inline-flex">
        <CopilotLauncher onClick={onOpenCopilot} />
      </div>
      <button
        onClick={onOpenCopilot}
        className="md:hidden h-9 w-9 rounded-md border bg-background/80 hover:bg-muted flex items-center justify-center iridescent-border"
        aria-label="Ask Pulse"
      >
        <Sparkles className="h-4 w-4 text-primary" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-9 gap-1.5 px-2.5 md:px-3">
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
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-semibold text-sm">Notifications</div>
            <button
              onClick={() => toast.success("All notifications marked as read")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => {
              const target =
                n.type === "approval" ? "/leave" : n.type === "alert" ? "/expenses" : "/payroll";
              return (
                <button
                  key={n.id}
                  onClick={() => navigate({ to: target })}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50",
                    n.unread && "bg-info/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-2 w-2 mt-1.5 rounded-full shrink-0",
                        n.type === "approval" && "bg-info",
                        n.type === "alert" && "bg-destructive",
                        n.type === "info" && "bg-muted-foreground/40",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{n.time}</div>
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
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: "oklch(0.6 0.16 220)" }}
            >
              AC
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium leading-tight">Alex Carter</div>
              <div className="text-[10px] text-muted-foreground leading-tight">HR Admin</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Alex Carter</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Switch role</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/landing">Marketing site</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/login">Sign out</Link>
          </DropdownMenuItem>
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
    <div className="flex items-start justify-between gap-4 mb-6">
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
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium shrink-0"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
