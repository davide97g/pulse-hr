import { createFileRoute } from "@tanstack/react-router";
import { SaturationEditorial } from "@/components/saturation/SaturationEditorial";

export const Route = createFileRoute("/saturation")({
  head: () => ({ meta: [{ title: "Saturazione — Pulse HR" }] }),
  component: SaturationPage,
});

function SaturationPage() {
  return <SaturationEditorial />;
}
