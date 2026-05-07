import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kudos")({
  beforeLoad: () => {
    throw redirect({ to: "/growth", search: { tab: "kudos" } });
  },
});
