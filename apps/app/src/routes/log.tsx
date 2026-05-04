import { createFileRoute, Outlet } from "@tanstack/react-router";

type LogSearch = { view?: "me" | "team" };

export const Route = createFileRoute("/log")({
  head: () => ({ meta: [{ title: "Status Log — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): LogSearch => ({
    view: s.view === "team" || s.view === "me" ? s.view : undefined,
  }),
  component: LogLayout,
});

function LogLayout() {
  return <Outlet />;
}
