import { createTable } from "@/lib/storage";
import { timesheetTemplatesSeed, type TimesheetTemplate } from "@/lib/mock-data";

export const timesheetTemplatesTable = createTable<TimesheetTemplate>(
  "timesheetTemplates",
  timesheetTemplatesSeed,
  "tt",
);

export function useTimesheetTemplates(): TimesheetTemplate[] {
  return timesheetTemplatesTable.useAll();
}
