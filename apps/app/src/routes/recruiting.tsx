import { createFileRoute } from "@tanstack/react-router";
import { RecruitingEditorial } from "@/components/recruiting/RecruitingEditorial";

export const Route = createFileRoute("/recruiting")({
  head: () => ({ meta: [{ title: "Recruiting — Pulse HR" }] }),
  component: RecruitingPage,
});

function RecruitingPage() {
  return <RecruitingEditorial />;
}
