import { get } from "lodash-es";

import type { PutEditAdvertisementRequest } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(async (event) => {
  const body: PutEditAdvertisementRequest = await readBody(event);

  if (!serverData.list) {
    serverData.list = {};
  }

  const target = get(serverData.list, body.id, undefined);

  if (target === undefined) {
    return response(200404, "没有对应的广告", {});
  }

  Object.assign(target, body);

  return response(200, "", {});
});