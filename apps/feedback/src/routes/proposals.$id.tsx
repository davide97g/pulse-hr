import { createFileRoute } from "@tanstack/react-router";
import { ContributionDetail } from "@/components/feedback/ContributionDetail";

export const Route = createFileRoute("/proposals/$id")({
  head: () => ({ meta: [{ title: "Proposal — Pulse" }] }),
  component: ProposalDetailRoute,
});

function ProposalDetailRoute() {
  const { id } = Route.useParams();
  return <ContributionDetail kind="proposal" id={id} />;
}
