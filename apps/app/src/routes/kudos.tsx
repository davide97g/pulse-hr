import { createFileRoute } from "@tanstack/react-router";
import { KudosEditorial } from "@/components/kudos/KudosEditorial";

export const Route = createFileRoute("/kudos")({
  head: () => ({ meta: [{ title: "Kudos — Pulse HR" }] }),
  component: KudosPage,
});

function KudosPage() {
  return <KudosEditorial />;
}
