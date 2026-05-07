import { createFileRoute } from "@tanstack/react-router";
import { StatusLogEditorial } from "@/components/log/StatusLogEditorial";

type LogSearch = { view?: "me" | "team" };

export const Route = createFileRoute("/log/")({
  validateSearch: (s: Record<string, unknown>): LogSearch => ({
    view: s.view === "team" || s.view === "me" ? s.view : undefined,
  }),
  head: () => ({ meta: [{ title: "Status Log — Pulse HR" }] }),
  component: LogIndexRoute,
});

function LogIndexRoute() {
  return <StatusLogEditorial />;
}
