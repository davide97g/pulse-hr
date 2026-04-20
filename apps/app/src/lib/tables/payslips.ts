import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { payslips, __setPayslips, type Payslip } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = payslips;

export const payslipsTable = createTable<Payslip>("payslips", seed, "ps");

export function usePayslips(): Payslip[] {
  return payslipsTable.useAll();
}

payslipsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setPayslips(payslipsTable.getAll());
});
