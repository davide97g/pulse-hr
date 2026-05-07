import { createFileRoute } from "@tanstack/react-router";
import { ProposalEditorial } from "@/components/proposal/ProposalEditorial";

export const Route = createFileRoute("/proposal/$id")({
  head: ({ params }) => ({ meta: [{ title: `Proposta ${params.id} — Pulse HR` }] }),
  component: ProposalRoute,
});

function ProposalRoute() {
  const { id } = Route.useParams();
  return <ProposalEditorial id={id} />;
}
