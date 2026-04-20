import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { jobPostings, __setJobPostings, type JobPosting } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = jobPostings;

export const jobPostingsTable = createTable<JobPosting>("jobPostings", seed, "jp");

export function useJobPostings(): JobPosting[] {
  return jobPostingsTable.useAll();
}

jobPostingsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setJobPostings(jobPostingsTable.getAll());
});
