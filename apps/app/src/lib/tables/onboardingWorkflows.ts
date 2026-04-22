import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import {
  onboardingWorkflows,
  __setOnboardingWorkflows,
  type OnboardingWorkflow,
} from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = onboardingWorkflows;

export const onboardingWorkflowsTable = createTable<OnboardingWorkflow>(
  "onboardingWorkflows",
  seed,
  "ow",
);

export function useOnboardingWorkflows(): OnboardingWorkflow[] {
  return onboardingWorkflowsTable.useAll();
}

onboardingWorkflowsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setOnboardingWorkflows(onboardingWorkflowsTable.getAll());
});
