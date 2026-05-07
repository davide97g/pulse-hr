import { createFileRoute } from "@tanstack/react-router";
import { OrgEditorial } from "@/components/org/OrgEditorial";

export const Route = createFileRoute("/org")({
  head: () => ({ meta: [{ title: "Organico — Pulse HR" }] }),
  component: OrgPage,
});

function OrgPage() {
  return <OrgEditorial />;
}
