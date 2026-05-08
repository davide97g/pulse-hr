import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { roomsSeed, __setRooms, type Room } from "@/lib/offices";

export const roomsTable = createTable<Room>("rooms", roomsSeed, "rm");

export function useRooms(): Room[] {
  return roomsTable.useAll();
}

export function useRoom(id: string): Room | undefined {
  return roomsTable.useById(id);
}

roomsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setRooms(roomsTable.getAll());
});
