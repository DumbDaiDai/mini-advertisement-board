import { get } from "lodash-es";

import type { GetAdvertisementDetailRequest, GetAdvertisementDetailResponse } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(async (event) => {
  const query: GetAdvertisementDetailRequest = await getQuery(event);

  if (!serverData.list) {
    serverData.list = {};
  }

  const target = get(serverData.list, query.id, undefined);

  if (target === undefined) {
    return response(200404, "没有对应的广告", {});
  }

  return response<GetAdvertisementDetailResponse>(200, "", {
    id: query.id,
    ...target
  });
});