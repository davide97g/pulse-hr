import { createFileRoute } from "@tanstack/react-router";
import { ForecastEditorial } from "@/components/forecast/ForecastEditorial";

export const Route = createFileRoute("/forecast")({
  head: () => ({ meta: [{ title: "Forecast — Pulse HR" }] }),
  component: ForecastPage,
});

function ForecastPage() {
  return <ForecastEditorial />;
}
