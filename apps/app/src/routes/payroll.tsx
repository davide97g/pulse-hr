import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/payroll")({
  component: () => <Navigate to="/" replace />,
});
