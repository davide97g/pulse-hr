import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Clock,
  Calendar,
  FileText,
  BookOpen,
  MessagesSquare,
  Trophy,
  Briefcase,
  Building2,
  PanelLeft,
  LifeBuoy,
  ListChecks,
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
 * Editorial sidebar — Dashboard sits unlabelled at the top, then PEOPLE / TIME
 * / WORK / OTHER, with a collapsed Workspace footer for Docs, Help, Settings.
 * Pages without an editorial counterpart (Marketplace, Developers, Modules)
 * live behind the avatar dropdown so they don't compete with day-to-day work.
 */
export function buildSidebarNavGroups(
  hasOpenManagerAsks: boolean,
  includeAdminVisibilityLink: boolean,
): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [
    {
      label: "",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, featureId: "dashboard" }],
    },
    {
      label: "People",
      items: [
        { to: "/people", label: "Team", icon: Users, featureId: "people" },
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
      label: "Time",
      items: [
        { to: "/time", label: "Timesheet", icon: Clock, featureId: "time" },
        { to: "/leave", label: "Leave", icon: Calendar, featureId: "leave" },
      ],
    },
    {
      label: "Work",
      items: [
        { to: "/projects", label: "Projects", icon: Briefcase, featureId: "clients" },
        { to: "/activities", label: "Activities", icon: ListChecks, featureId: "clients" },
      ],
    },
    {
      label: "Other",
      items: [
        { to: "/offices", label: "Offices", icon: Building2, featureId: "offices" },
        { to: "/reports", label: "Reports", icon: BarChart3, featureId: "reports" },
        { to: "/documents", label: "Documents", icon: FileText, featureId: "documents" },
      ],
    },
  ];

  // Workspace section — collapsed at the bottom, secondary tools that the
  // Editorial design pushes out of the primary nav. Items still register so
  // ⌘K, the avatar menu, and direct links continue to work.
  const workspace: SidebarNavGroup = {
    label: "Workspace",
    items: [{ to: "/docs", label: "Docs", icon: BookOpen, featureId: "docs" }],
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
