import { createFileRoute } from "@tanstack/react-router";
import { FocusEditorial } from "@/components/focus/FocusEditorial";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus — Pulse HR" }] }),
  component: FocusPage,
});

function FocusPage() {
  return <FocusEditorial />;
}
