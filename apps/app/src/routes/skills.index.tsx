import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffectiveRole } from "@/lib/role-override";

export const Route = createFileRoute("/skills/")({
  component: SkillsIndex,
});

function SkillsIndex() {
  const role = useEffectiveRole();
  const isManagerSurface = role === "manager" || role === "hr" || role === "admin";
  return <Navigate to={isManagerSurface ? "/skills/team" : "/skills/me"} replace />;
}
