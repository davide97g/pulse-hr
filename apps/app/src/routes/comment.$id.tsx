import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { CommentThreadEditorial } from "@/components/comments/CommentThreadEditorial";
import { setPageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/comment/$id")({
  component: CommentRoute,
});

function CommentRoute() {
  const { id } = Route.useParams();
  useEffect(() => {
    setPageMeta({
      title: `Discussione ${id} — Pulse HR`,
      description: "Join the discussion on Pulse HR — share context, ask questions, vote.",
    });
  }, [id]);
  return <CommentThreadEditorial id={id} />;
}
