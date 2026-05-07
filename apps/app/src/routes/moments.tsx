import { createFileRoute } from "@tanstack/react-router";
import { MomentsEditorial } from "@/components/moments/MomentsEditorial";

export const Route = createFileRoute("/moments")({
  head: () => ({ meta: [{ title: "Momenti — Pulse HR" }] }),
  component: MomentsPage,
});

function MomentsPage() {
  return <MomentsEditorial />;
}
