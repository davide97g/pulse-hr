import { createFileRoute } from "@tanstack/react-router";
import { ClientsEditorial } from "@/components/clients/ClientsEditorial";

export const Route = createFileRoute("/clients/")({
  head: () => ({ meta: [{ title: "Clienti — Pulse HR" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  return <ClientsEditorial />;
}
