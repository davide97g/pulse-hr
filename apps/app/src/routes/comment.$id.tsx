import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? "https://feedback.pulsehr.it";

export const Route = createFileRoute("/comment/$id")({
  head: () => ({ meta: [{ title: "Comment — Pulse HR" }] }),
  component: CommentRedirect,
});

function CommentRedirect() {
  const { id } = Route.useParams();
  useEffect(() => {
    window.location.replace(`${FEEDBACK_URL}/comments/${encodeURIComponent(id)}`);
  }, [id]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Redirecting to Pulse Feedback…
    </div>
  );
}
