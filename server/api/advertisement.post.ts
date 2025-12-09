import { set } from "lodash-es";

import type { PostCreateAdvertisementRequest } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(async (event) => {
  const body: PostCreateAdvertisementRequest = await readBody(event);

  if (!serverData.nextId) {
    serverData.nextId = 0;
  }
  if (!serverData.list) {
    serverData.list = {};
  }

  set(serverData.list, serverData.nextId, {
    hot: 0,
    ...body
  });
  ++serverData.nextId;

  return response(200, "", {});
});