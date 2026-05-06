import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { EmployeeLogView } from "@/components/log/EmployeeLogView";
import { ManagerLogView } from "@/components/log/ManagerLogView";
import { useEffectiveRole } from "@/lib/role-override";

type LogSearch = { view?: "me" | "team" };

export const Route = createFileRoute("/log/")({
  validateSearch: (s: Record<string, unknown>): LogSearch => ({
    view: s.view === "team" || s.view === "me" ? s.view : undefined,
  }),
  head: () => ({ meta: [{ title: "Status Log — Pulse HR" }] }),
  component: LogIndexRoute,
});

function LogIndexRoute() {
  const role = useEffectiveRole();
  const { view } = Route.useSearch();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 420);
    return () => clearTimeout(t);
  }, []);

  const isManager = role === "manager" || role === "hr" || role === "admin";
  const showTeam = isManager && view !== "me";

  const today = new Date();
  const months = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
  const days = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];
  const dateLabel = `${days[today.getDay()]} ${String(today.getDate()).padStart(2, "0")} ${months[today.getMonth()]}`;

  return (
    <div className="flex flex-col">
      <header
        className="flex items-end justify-between gap-6 flex-wrap"
        style={{ padding: "32px 48px 24px" }}
      >
        <div className="min-w-0">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {dateLabel} · STANDUP ASINCRONO
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(72px, 9vw, 124px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            Cosa <span style={{ fontStyle: "italic" }}>oggi</span>
            <span style={{ color: "var(--spark)" }}>?</span>
          </h1>
          <p
            style={{
              marginTop: 18,
              maxWidth: 460,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            {showTeam
              ? "Salute del team e recap. Niente chat grezze. Read-only fino alle 10."
              : "Tre righe a testa. Niente call. Read-only fino alle 10."}
          </p>
        </div>
        <Link to="/log/recap" className="pill pill-ghost pill-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Sentiment recap
        </Link>
        <span className="sr-only">
          <EditorialPill kind="ghost" />
        </span>
      </header>

      {ready ? (
        showTeam ? (
          <ManagerLogView />
        ) : (
          <EmployeeLogView />
        )
      ) : (
        <div className="space-y-3 p-12">
          <div className="h-14 rounded-lg bg-muted animate-pulse" />
          <div className="h-14 rounded-lg bg-muted animate-pulse" />
          <div className="h-14 rounded-lg bg-muted animate-pulse" />
          <div className="h-14 rounded-lg bg-muted animate-pulse" />
        </div>
      )}
    </div>
  );
}
