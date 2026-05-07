import { createFileRoute } from "@tanstack/react-router";
import { CommentThreadEditorial } from "@/components/comments/CommentThreadEditorial";

export const Route = createFileRoute("/comment/$id")({
  head: ({ params }) => ({ meta: [{ title: `Discussione ${params.id} — Pulse HR` }] }),
  component: CommentRoute,
});

function CommentRoute() {
  const { id } = Route.useParams();
  return <CommentThreadEditorial id={id} />;
}
