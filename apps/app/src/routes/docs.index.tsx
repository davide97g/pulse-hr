import { createFileRoute } from "@tanstack/react-router";
import { DocsEditorial } from "@/components/docs/DocsEditorial";

export const Route = createFileRoute("/docs/")({
  head: () => ({ meta: [{ title: "Docs — Pulse HR" }] }),
  component: DocsIndex,
});

function DocsIndex() {
  return <DocsEditorial />;
}
