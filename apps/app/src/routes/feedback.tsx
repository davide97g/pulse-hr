import { createFileRoute } from "@tanstack/react-router";
import { FeedbackEditorial } from "@/components/feedback/FeedbackEditorial";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Pulse Survey — Pulse HR" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  return <FeedbackEditorial />;
}
