import { get } from "lodash-es";

import type { PutViewAdvertisementRequest } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(async (event) => {
  const body: PutViewAdvertisementRequest = await readBody(event);

  if (!serverData.list) {
    serverData.list = {};
  }

  const target = get(serverData.list, body.id, undefined);

  if (target === undefined) {
    return response(200404, "没有对应的广告", {});
  }

  ++target.hot;

  return response(200, "", {});
});