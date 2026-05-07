import { createFileRoute } from "@tanstack/react-router";
import { ProjectEditorial } from "@/components/projects/ProjectEditorial";

export const Route = createFileRoute("/projects/$projectId")({
  head: ({ params }) => ({ meta: [{ title: `Commessa ${params.projectId} — Pulse HR` }] }),
  component: ProjectDetailRoute,
});

function ProjectDetailRoute() {
  const { projectId } = Route.useParams();
  return <ProjectEditorial projectId={projectId} />;
}
