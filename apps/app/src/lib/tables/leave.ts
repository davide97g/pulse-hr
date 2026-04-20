/**
 * Persistent leave-requests table. Same shape as employees: a hook for new
 * code, plus a write-through to the mock-data live binding so legacy
 * consumers (`import { leaveRequests }`) pick up changes via TableStoreProvider.
 */
import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { leaveRequestsSeed, __setLeaveRequests, type LeaveRequest } from "@/lib/mock-data";

export const leaveTable = createTable<LeaveRequest>("leaveRequests", leaveRequestsSeed, "l");

export function useLeaveRequests(): LeaveRequest[] {
  return leaveTable.useAll();
}

export function useLeaveRequest(id: string): LeaveRequest | undefined {
  return leaveTable.useById(id);
}

export function leaveRequestById(id: string): LeaveRequest | undefined {
  return leaveTable.getAll().find((l) => l.id === id);
}

leaveTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setLeaveRequests(leaveTable.getAll());
});
