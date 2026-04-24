import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Clock,
  Calendar,
  CalendarDays,
  FileText,
  Receipt,
  CreditCard,
  Network,
  GraduationCap,
  Megaphone,
  Puzzle,
  Code2,
  BookOpen,
  TrendingUp,
  MessagesSquare,
  Gift,
  Focus,
  Trophy,
  Gauge,
  MessageSquare,
  Briefcase as BriefcaseIcon,
  Building2,
  PanelLeft,
  Send,
} from "lucide-react";
import type { SidebarFeatureId } from "@/lib/sidebar-features";
import { ADMIN_SIDEBAR_VISIBILITY_PATH } from "@/lib/sidebar-features";

export type SidebarNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** When set, visibility follows workspace toggles (non-admins). */
  featureId?: SidebarFeatureId;
  /** Render a notification dot (e.g. unread activity). Not for "new feature" marketing. */
  unreadDot?: boolean;
};

export type SidebarNavGroup = { label: string; items: SidebarNavItem[]; accent?: boolean };

export function buildSidebarNavGroups(
  hasOpenManagerAsks: boolean,
  includeAdminVisibilityLink: boolean,
): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [
    {
      label: "Overview",
      items: [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, featureId: "dashboard" },
        {
          to: "/announcements",
          label: "Announcements",
          icon: Megaphone,
          featureId: "announcements",
        },
      ],
    },
    {
      label: "Me",
      items: [
        {
          to: "/log",
          label: "Status Log",
          icon: MessagesSquare,
          featureId: "log",
          unreadDot: hasOpenManagerAsks,
        },
        { to: "/focus", label: "Focus Mode", icon: Focus, featureId: "focus" },
        { to: "/growth", label: "Growth", icon: Trophy, featureId: "growth" },
        { to: "/kudos", label: "Kudos", icon: Gift, featureId: "kudos" },
      ],
    },
    {
      label: "People",
      items: [
        { to: "/people", label: "Employees", icon: Users, featureId: "people" },
        { to: "/org", label: "Org chart", icon: Network, featureId: "org" },
        { to: "/recruiting", label: "Recruiting", icon: Briefcase, featureId: "recruiting" },
        { to: "/onboarding", label: "Onboarding", icon: GraduationCap, featureId: "onboarding" },
      ],
    },
    {
      label: "Work",
      items: [
        {
          to: "/clients",
          label: "Clients & Projects",
          icon: BriefcaseIcon,
          featureId: "clients",
        },
        { to: "/time", label: "Time & attendance", icon: Clock, featureId: "time" },
        { to: "/calendar", label: "Calendar", icon: CalendarDays, featureId: "calendar" },
        { to: "/leave", label: "Leave", icon: Calendar, featureId: "leave" },
        { to: "/documents", label: "Documents", icon: FileText, featureId: "documents" },
        { to: "/offices", label: "Offices", icon: Building2, featureId: "offices" },
      ],
    },
    {
      label: "Money",
      items: [
        { to: "/payroll", label: "Payroll", icon: CreditCard, featureId: "payroll" },
        { to: "/expenses", label: "Expenses", icon: Receipt, featureId: "expenses" },
        {
          to: "/forecast",
          label: "Commessa Forecast",
          icon: TrendingUp,
          featureId: "forecast",
        },
      ],
    },
    {
      label: "Insights",
      items: [
        { to: "/reports", label: "Reports", icon: BarChart3, featureId: "reports" },
        {
          to: "/saturation",
          label: "Saturation",
          icon: Gauge,
          featureId: "saturation",
        },
      ],
    },
    {
      label: "Workspace",
      items: [
        { to: "/feedback", label: "Feedback", icon: MessageSquare, featureId: "feedback" },
        { to: "/marketplace", label: "Marketplace", icon: Puzzle, featureId: "marketplace" },
        { to: "/developers", label: "Developers", icon: Code2, featureId: "developers" },
        { to: "/docs", label: "Docs", icon: BookOpen, featureId: "docs" },
        { to: "/settings", label: "Settings", icon: Settings, featureId: "settings" },
      ],
    },
  ];

  if (includeAdminVisibilityLink) {
    const ws = groups.find((g) => g.label === "Workspace");
    if (ws) {
      ws.items = [
        ...ws.items,
        {
          to: ADMIN_SIDEBAR_VISIBILITY_PATH,
          label: "Sidebar visibility",
          icon: PanelLeft,
        },
        {
          to: "/admin/send-email",
          label: "Send email",
          icon: Send,
        },
      ];
    }
  }

  return groups;
}
