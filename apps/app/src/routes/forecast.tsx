import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/forecast")({
  component: () => <Navigate to="/" replace />,
});
