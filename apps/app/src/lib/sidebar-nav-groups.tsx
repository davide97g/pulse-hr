import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Calendar,
  BookOpen,
  MessagesSquare,
  Trophy,
  PanelLeft,
  LifeBuoy,
  Sparkles,
  Network,
  Gauge,
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
 * People-first sidebar. Dashboard sits unlabelled, then YOU (personal growth +
 * status), WELLBEING (rest + load), PEOPLE (directory + insights). Business-ops
 * surfaces (time, projects, activities, clients, recruiting, documents,
 * offices, announcements, marketplace, developers) are parked — their routes
 * still resolve, but they don't appear in the primary nav. See plan file
 * `help-me-refine-the-velvet-fiddle` and `wiki/AGENTS.md` for the rationale.
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
      label: "You",
      items: [
        {
          to: "/log",
          label: "Status log",
          icon: MessagesSquare,
          featureId: "log",
          unreadDot: hasOpenManagerAsks,
        },
        { to: "/growth", label: "Growth", icon: Trophy, featureId: "growth" },
        { to: "/moments", label: "Moments", icon: Sparkles },
      ],
    },
    {
      label: "Wellbeing",
      items: [
        { to: "/leave", label: "Leave", icon: Calendar, featureId: "leave" },
        { to: "/saturation", label: "Workload", icon: Gauge, featureId: "saturation" },
      ],
    },
    {
      label: "People",
      items: [
        { to: "/people", label: "Team", icon: Users, featureId: "people" },
        { to: "/org", label: "Org chart", icon: Network, featureId: "org" },
        { to: "/reports", label: "People Insights", icon: BarChart3, featureId: "reports" },
      ],
    },
  ];

  // Workspace section — collapsed at the bottom, secondary tools.
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
