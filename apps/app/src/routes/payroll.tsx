import { createFileRoute } from "@tanstack/react-router";
import { PayrollEditorial } from "@/components/payroll/PayrollEditorial";

export const Route = createFileRoute("/payroll")({
  head: () => ({ meta: [{ title: "Payroll — Pulse HR" }] }),
  component: PayrollPage,
});

function PayrollPage() {
  return <PayrollEditorial />;
}
