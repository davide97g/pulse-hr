import type { Employee, EmployeeLogHealth, ManagerAsk, LogSession } from "@/lib/mock-data";

export function EmployeeRecapCard(_: {
  employee: Employee;
  health: EmployeeLogHealth;
  asks: ManagerAsk[];
  sessions: LogSession[];
}) {
  return (
    <div className="rounded-lg border p-4 text-muted-foreground">Recap — coming up in Task 9.</div>
  );
}
