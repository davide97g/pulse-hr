import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessagesSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@pulse-hr/ui/primitives/button";
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

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      <div className="px-4 md:px-6 pt-4 md:pt-6 flex items-start justify-between gap-3 flex-wrap">
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5" />
              Status Log
            </span>
          }
          description={
            showTeam ? "Team health and recaps — no raw chats." : "Your private agentic log."
          }
        />
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link to="/log/recap">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Sentiment recap
          </Link>
        </Button>
      </div>
      {ready ? (
        showTeam ? (
          <ManagerLogView />
        ) : (
          <EmployeeLogView />
        )
      ) : (
        <div className="space-y-3 p-4 md:p-6">
          <div className="h-14 rounded-lg bg-muted animate-pulse" />
          <div className="h-14 rounded-lg bg-muted animate-pulse" />
          <div className="h-14 rounded-lg bg-muted animate-pulse" />
          <div className="h-14 rounded-lg bg-muted animate-pulse" />
        </div>
      )}
    </div>
  );
}
