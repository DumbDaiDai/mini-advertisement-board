import type { Advertisement } from "~/service/types";

export const serverData: Partial<{
  loggedInAt: number;
  nextId: number;
  list: {
    [id: number]: Omit<Advertisement, "id">
  }
}> = {};