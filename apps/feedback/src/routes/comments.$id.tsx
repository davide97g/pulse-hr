import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ContributionDetail } from "@/components/feedback/ContributionDetail";
import { setPageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/comments/$id")({
  component: CommentDetailRoute,
});

function CommentDetailRoute() {
  const { id } = Route.useParams();
  useEffect(() => {
    setPageMeta({
      title: `Comment ${id} — Pulse Feedback`,
      description: "Read the comment and join the discussion on Pulse Feedback.",
    });
  }, [id]);
  return <ContributionDetail kind="comment" id={id} />;
}
