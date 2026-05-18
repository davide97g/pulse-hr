import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ProposalEditorial } from "@/components/proposal/ProposalEditorial";
import { setPageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/proposal/$id")({
  component: ProposalRoute,
});

function ProposalRoute() {
  const { id } = Route.useParams();
  useEffect(() => {
    setPageMeta({
      title: `Proposta ${id} — Pulse HR`,
      description: "Read the proposal, weigh in, and vote — Pulse HR feedback board.",
    });
  }, [id]);
  return <ProposalEditorial id={id} />;
}
