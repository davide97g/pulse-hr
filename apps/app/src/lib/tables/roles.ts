import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { rolesSeed, __setRolesSeed } from "@/lib/mock-data";

// mock-data declares TWO `Role` types (the string union used by employee.role
// and the object shape used by the settings "Roles" table). TypeScript resolves
// `Role` to the union which doesn't fit `Table<T extends { id: string }>`. We
// inline the object shape here so the table is usable; a future pass should
// rename the collision in mock-data.
export interface RolePermission {
  id: string;
  name: string;
  desc: string;
  count: number;
  color: string;
}

const seed = rolesSeed as unknown as RolePermission[];

export const rolesTable = createTable<RolePermission>("roles", seed, "r");

export function useRoles(): RolePermission[] {
  return rolesTable.useAll();
}

rolesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setRolesSeed(rolesTable.getAll() as unknown as typeof rolesSeed);
});
