import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Building2, CalendarClock, ShieldCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import { PageHeader } from "@/components/app/AppShell";
import { NewBadge } from "@pulse-hr/ui/atoms/NewBadge";
import { OfficesOverviewPanel } from "@/components/app/OfficesOverviewPanel";
import { OfficesReservationsPanel } from "@/components/app/OfficesReservationsPanel";
import { OfficesManagePanel } from "@/components/app/OfficesManagePanel";
import type { HeatmapMode } from "@/components/app/OfficeHeatmap";

type Section = "overview" | "reservations" | "manage";

interface OfficesSearch {
  section?: Section;
  // overview
  date?: string;
  mode?: HeatmapMode;
  office?: string;
  all?: boolean;
  // reservations
  rtab?: "upcoming" | "past" | "all";
  roffice?: string;
  ruser?: string;
  rkind?: "room" | "seat";
  rq?: string;
}

export const Route = createFileRoute("/offices")({
  head: () => ({ meta: [{ title: "Offices — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): OfficesSearch => ({
    section:
      s.section === "overview" || s.section === "reservations" || s.section === "manage"
        ? s.section
        : undefined,
    date: typeof s.date === "string" ? s.date : undefined,
    mode: s.mode === "rooms" || s.mode === "seats" || s.mode === "combined" ? s.mode : undefined,
    office: typeof s.office === "string" ? s.office : undefined,
    all: s.all === true || s.all === "1" || s.all === "true" ? true : undefined,
    rtab: s.rtab === "upcoming" || s.rtab === "past" || s.rtab === "all" ? s.rtab : undefined,
    roffice: typeof s.roffice === "string" ? s.roffice : undefined,
    ruser: typeof s.ruser === "string" ? s.ruser : undefined,
    rkind: s.rkind === "room" || s.rkind === "seat" ? s.rkind : undefined,
    rq: typeof s.rq === "string" ? s.rq : undefined,
  }),
  component: OfficesRoute,
});

function OfficesRoute() {
  const nav = useNavigate({ from: "/offices" });
  const search = useSearch({ from: "/offices" });
  const section: Section = search.section ?? "overview";

  const setSection = (v: string) =>
    nav({
      search: (prev) => ({
        ...prev,
        section: v === "overview" ? undefined : (v as Section),
      }),
    });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        eyebrow={
          <>
            WORK · SEDI · STANZE & PRENOTAZIONI <NewBadge />
          </>
        }
        title={
          <>
            Quattro <span className="spark-mark">stanze</span>
            <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
          </>
        }
        description="Workspace, prenotazioni, catalogo — un solo posto per gestire tutto."
      />

      <Tabs value={section} onValueChange={setSection}>
        <TabsList>
          <TabsTrigger value="overview">
            <Building2 className="h-3.5 w-3.5 mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="reservations">
            <CalendarClock className="h-3.5 w-3.5 mr-1.5" /> Reservations
          </TabsTrigger>
          <TabsTrigger value="manage">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OfficesOverviewPanel />
        </TabsContent>
        <TabsContent value="reservations" className="mt-4">
          <OfficesReservationsPanel />
        </TabsContent>
        <TabsContent value="manage" className="mt-4">
          <OfficesManagePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
