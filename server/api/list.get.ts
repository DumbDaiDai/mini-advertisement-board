import { sortBy } from "lodash-es";

import { GetAdvertisementListRequest, GetAdvertisementListResponse } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler((event) => {
  const query: GetAdvertisementListRequest = getQuery(event);
  const pageIndex = Number(query.pageIndex);
  const capacity = Number(query.capacity);

  return response<GetAdvertisementListResponse>(200, "", {
    total: serverData.list?.length || 0,
    list: sortBy(serverData.list,
      (ad) => ad.price + (ad.price * ad.hot * 0.42))
      .toReversed()
      .slice((pageIndex - 1) * capacity, pageIndex * capacity - 1)
  });
});