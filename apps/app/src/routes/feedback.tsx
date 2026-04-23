import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? "https://feedback.pulsehr.it";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Pulse HR" }] }),
  component: FeedbackRedirect,
});

function FeedbackRedirect() {
  useEffect(() => {
    window.location.replace(FEEDBACK_URL);
  }, []);
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Redirecting to Pulse Feedback…
    </div>
  );
}
