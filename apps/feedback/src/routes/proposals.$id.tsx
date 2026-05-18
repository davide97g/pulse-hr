import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ContributionDetail } from "@/components/feedback/ContributionDetail";
import { setPageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/proposals/$id")({
  component: ProposalDetailRoute,
});

function ProposalDetailRoute() {
  const { id } = Route.useParams();
  useEffect(() => {
    setPageMeta({
      title: `Proposal ${id} — Pulse Feedback`,
      description: "Read the proposal, weigh in, and vote on Pulse Feedback.",
    });
  }, [id]);
  return <ContributionDetail kind="proposal" id={id} />;
}
