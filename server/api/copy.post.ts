import { cloneDeep, get, set } from "lodash-es";

import type { PostCopyAdvertisementRequest } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(async (event) => {
  const body: PostCopyAdvertisementRequest = await readBody(event);

  if (!serverData.list) {
    serverData.list = {};
  }
  if (!serverData.nextId) {
    serverData.nextId = 0;
  }

  const origin = get(serverData.list, body.id, undefined);

  if (origin === undefined) {
    return response(200404, "没有对应的广告", {});
  }

  const clone = cloneDeep(origin);
  clone.title += " 复件";
  clone.hot = 0;
  set(serverData.list, serverData.nextId, clone);
  ++serverData.nextId;

  return response(200, "", {});
});