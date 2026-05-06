import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Clock,
  Calendar,
  CalendarDays,
  FileText,
  Receipt,
  GraduationCap,
  Puzzle,
  Code2,
  BookOpen,
  MessagesSquare,
  Gift,
  Focus,
  Trophy,
  Briefcase,
  Building2,
  PanelLeft,
  LifeBuoy,
  ListChecks,
  Wallet,
  TrendingUp,
} from "lucide-react";
import type { SidebarFeatureId } from "@/lib/sidebar-features";
import { ADMIN_MODULES_PATH } from "@/lib/sidebar-features";

export type SidebarNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** When set, visibility follows workspace toggles (non-admins). */
  featureId?: SidebarFeatureId;
  /** Render a notification dot (e.g. unread activity). Not for "new feature" marketing. */
  unreadDot?: boolean;
  /** When true, `to` is an absolute URL — render as <a> instead of a router Link. */
  external?: boolean;
  /**
   * When set, the item renders a custom widget instead of a link. Currently
   * used for the Help & tours dropdown trigger that lives inline in the nav.
   */
  kind?: "tours";
};

export type SidebarNavGroup = { label: string; items: SidebarNavItem[]; accent?: boolean };

/**
 * Editorial sidebar — three groups (PEOPLE / WORK / MONEY) plus a collapsed
 * Workspace footer. Pages without an editorial counterpart (Marketplace,
 * Developers, Docs, Settings, Modules, Help) live behind the avatar dropdown
 * so they don't compete with day-to-day work in the sidebar.
 */
export function buildSidebarNavGroups(
  hasOpenManagerAsks: boolean,
  includeAdminVisibilityLink: boolean,
): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [
    {
      label: "People",
      items: [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, featureId: "dashboard" },
        { to: "/people", label: "Persone", icon: Users, featureId: "people" },
        {
          to: "/onboarding",
          label: "Onboarding",
          icon: GraduationCap,
          featureId: "onboarding",
        },
        { to: "/kudos", label: "Kudos", icon: Gift, featureId: "kudos" },
        {
          to: "/log",
          label: "Status log",
          icon: MessagesSquare,
          featureId: "log",
          unreadDot: hasOpenManagerAsks,
        },
        { to: "/growth", label: "Growth", icon: Trophy, featureId: "growth" },
      ],
    },
    {
      label: "Work",
      items: [
        { to: "/time", label: "Timesheet", icon: Clock, featureId: "time" },
        { to: "/projects", label: "Commesse", icon: Briefcase, featureId: "clients" },
        { to: "/forecast", label: "Forecast", icon: TrendingUp, featureId: "clients" },
        { to: "/focus", label: "Focus", icon: Focus, featureId: "focus" },
        { to: "/activities", label: "Activities", icon: ListChecks, featureId: "clients" },
        { to: "/calendar", label: "Calendar", icon: CalendarDays, featureId: "calendar" },
        { to: "/leave", label: "Leave", icon: Calendar, featureId: "leave" },
        { to: "/documents", label: "Documents", icon: FileText, featureId: "documents" },
        { to: "/offices", label: "Offices", icon: Building2, featureId: "offices" },
      ],
    },
    {
      label: "Money",
      items: [
        { to: "/payroll", label: "Payroll", icon: Wallet, featureId: "expenses" },
        { to: "/expenses", label: "Spese", icon: Receipt, featureId: "expenses" },
      ],
    },
  ];

  // Workspace section — collapsed at the bottom, secondary tools that the
  // Editorial design pushes out of the primary nav. Items still register so
  // ⌘K, the avatar menu, and direct links continue to work.
  const workspace: SidebarNavGroup = {
    label: "Workspace",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3, featureId: "reports" },
      { to: "/marketplace", label: "Marketplace", icon: Puzzle, featureId: "marketplace" },
      { to: "/developers", label: "Developers", icon: Code2, featureId: "developers" },
      { to: "/docs", label: "Docs", icon: BookOpen, featureId: "docs" },
    ],
  };

  if (includeAdminVisibilityLink) {
    workspace.items.push({
      to: ADMIN_MODULES_PATH,
      label: "Modules",
      icon: PanelLeft,
    });
  }
  workspace.items.push({
    to: "#help",
    label: "Help & tours",
    icon: LifeBuoy,
    kind: "tours",
  });
  workspace.items.push({
    to: "/settings",
    label: "Settings",
    icon: Settings,
    featureId: "settings",
  });

  groups.push(workspace);
  return groups;
}
