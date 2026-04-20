import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { payrollRuns, __setPayrollRuns, type PayrollRun } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = payrollRuns;

export const payrollRunsTable = createTable<PayrollRun>("payrollRuns", seed, "pr");

export function usePayrollRuns(): PayrollRun[] {
  return payrollRunsTable.useAll();
}

payrollRunsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setPayrollRuns(payrollRunsTable.getAll());
});
