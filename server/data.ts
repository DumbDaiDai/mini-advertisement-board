import type { Advertisement } from "~/service/types";

export const serverData: Partial<{
  loggedInAt: number;
  list: Advertisement[]
}> = {};