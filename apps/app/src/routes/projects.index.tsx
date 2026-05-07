import { createFileRoute } from "@tanstack/react-router";
import { ProjectsEditorial } from "@/components/projects/ProjectsEditorial";

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "Projects — Pulse HR" }] }),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  return <ProjectsEditorial />;
}
