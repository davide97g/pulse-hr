import { createFileRoute } from "@tanstack/react-router";
import { GrowthEditorial } from "@/components/growth/GrowthEditorial";
import type { GrowthTab } from "@/components/growth/GrowthTabs";

const TABS: GrowthTab[] = ["overview", "achievements", "challenges", "kudos", "paths"];

type GrowthSearch = { tab?: GrowthTab; employee?: string };

export const Route = createFileRoute("/growth")({
  validateSearch: (s: Record<string, unknown>): GrowthSearch => {
    const raw = typeof s.tab === "string" ? (s.tab as GrowthTab) : undefined;
    const tab = raw && TABS.includes(raw) ? raw : undefined;
    const employee = typeof s.employee === "string" ? s.employee : undefined;
    return { tab, employee };
  },
  head: () => ({ meta: [{ title: "Crescita — Pulse HR" }] }),
  component: GrowthPage,
});

function GrowthPage() {
  const search = Route.useSearch();
  const tab: GrowthTab = search.tab ?? "overview";
  return <GrowthEditorial tab={tab} employee={search.employee} />;
}
