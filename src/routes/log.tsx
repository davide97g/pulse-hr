import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { useTheme } from "@/components/app/ThemeProvider";
import { EmployeeLogView } from "@/components/log/EmployeeLogView";
import { ManagerLogView } from "@/components/log/ManagerLogView";

type LogSearch = { view?: "me" | "team" };

export const Route = createFileRoute("/log")({
  head: () => ({ meta: [{ title: "Status Log — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): LogSearch => ({
    view: s.view === "team" || s.view === "me" ? s.view : undefined,
  }),
  component: LogRoute,
});

function LogRoute() {
  const { theme } = useTheme();
  const { view } = Route.useSearch();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 420);
    return () => clearTimeout(t);
  }, []);

  const isManager = theme === "manager" || theme === "hr" || theme === "admin";
  const showTeam = isManager && view !== "me";

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      <div className="px-4 md:px-6 pt-4 md:pt-6">
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
