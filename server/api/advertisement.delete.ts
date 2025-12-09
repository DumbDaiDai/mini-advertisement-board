import { unset } from "lodash-es";

import type { DeleteAdvertisementRequest } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(async (event) => {
  const query: DeleteAdvertisementRequest = await getQuery(event);
  query.id = Number(query.id);

  if (!serverData.list) {
    serverData.list = {};
  }

  if (!(Object.keys(serverData.list).includes(String(query.id)))) {
    return response(200404, "没有对应的广告", {});
  }

  unset(serverData.list, query.id);

  return response(200, "", {});
});