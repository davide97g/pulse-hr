import { createFileRoute } from "@tanstack/react-router";
import { ModulesEditorial } from "@/components/admin/ModulesEditorial";

export const Route = createFileRoute("/admin/modules")({
  head: () => ({ meta: [{ title: "Modules — Pulse HR" }] }),
  component: ModulesEditorial,
});
