import { createFileRoute } from "@tanstack/react-router";
import { ReportsEditorial } from "@/components/reports/ReportsEditorial";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Pulse HR" }] }),
  component: ReportsEditorial,
});
