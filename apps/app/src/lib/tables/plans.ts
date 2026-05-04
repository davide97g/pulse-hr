import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { plans, __setPlans, type Plan } from "@/lib/mock-data";

const seed = plans;

export const plansTable = createTable<Plan>("plans", seed, "pl");

export function usePlans(): Plan[] {
  return plansTable.useAll();
}

plansTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setPlans(plansTable.getAll());
});
