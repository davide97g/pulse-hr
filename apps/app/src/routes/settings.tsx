import { createFileRoute } from "@tanstack/react-router";
import { SettingsEditorial } from "@/components/settings/SettingsEditorial";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Impostazioni — Pulse HR" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return <SettingsEditorial />;
}
