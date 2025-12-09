import { sortBy } from "lodash-es";

import type { Advertisement, GetAdvertisementListRequest, GetAdvertisementListResponse } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler((event) => {
  const query: GetAdvertisementListRequest = getQuery(event);
  query.pageIndex = Number(query.pageIndex);
  query.capacity = Number(query.capacity);

  if (!serverData.list) {
    serverData.list = {};
  }

  return response<GetAdvertisementListResponse>(200, "", {
    total: Object.keys(serverData.list).length || 0,
    list: sortBy(
      Object.entries(serverData.list).map((idToAd) => ({
        id: Number(idToAd[0]),
        ...idToAd[1]
      } satisfies Advertisement)),
      (ad) => ad.price + (ad.price * ad.hot * 0.42))
      .toReversed()
      .slice((query.pageIndex - 1) * query.capacity, query.pageIndex * query.capacity)
  });
});