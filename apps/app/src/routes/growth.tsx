import { createFileRoute } from "@tanstack/react-router";
import { GrowthEditorial } from "@/components/growth/GrowthEditorial";

export const Route = createFileRoute("/growth")({
  head: () => ({ meta: [{ title: "Crescita — Pulse HR" }] }),
  component: GrowthPage,
});

function GrowthPage() {
  return <GrowthEditorial />;
}
