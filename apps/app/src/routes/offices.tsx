import { createFileRoute } from "@tanstack/react-router";
import { OfficesEditorial } from "@/components/offices/OfficesEditorial";

export const Route = createFileRoute("/offices")({
  head: () => ({ meta: [{ title: "Sedi — Pulse HR" }] }),
  component: OfficesPage,
});

function OfficesPage() {
  return <OfficesEditorial />;
}
