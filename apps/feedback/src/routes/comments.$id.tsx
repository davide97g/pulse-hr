import { createFileRoute } from "@tanstack/react-router";
import { ContributionDetail } from "@/components/feedback/ContributionDetail";

export const Route = createFileRoute("/comments/$id")({
  head: () => ({ meta: [{ title: "Comment — Pulse" }] }),
  component: CommentDetailRoute,
});

function CommentDetailRoute() {
  const { id } = Route.useParams();
  return <ContributionDetail kind="comment" id={id} />;
}
