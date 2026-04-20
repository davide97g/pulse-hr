/**
 * Persistent expenses table. Same shape as employees / leave.
 */
import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { expensesSeed, __setExpenses, type Expense } from "@/lib/mock-data";

export const expensesTable = createTable<Expense>("expenses", expensesSeed, "x");

export function useExpenses(): Expense[] {
  return expensesTable.useAll();
}

export function useExpense(id: string): Expense | undefined {
  return expensesTable.useById(id);
}

export function expenseById(id: string): Expense | undefined {
  return expensesTable.getAll().find((x) => x.id === id);
}

expensesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setExpenses(expensesTable.getAll());
});
