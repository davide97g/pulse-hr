import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementsEditorial } from "@/components/announcements/AnnouncementsEditorial";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Annunci — Pulse HR" }] }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return <AnnouncementsEditorial />;
}
