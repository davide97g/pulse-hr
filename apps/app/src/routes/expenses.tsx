import { createFileRoute } from "@tanstack/react-router";
import { ExpensesEditorial } from "@/components/expenses/ExpensesEditorial";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Spese — Pulse HR" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  return <ExpensesEditorial />;
}
