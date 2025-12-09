import { PostCreateRequest } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(async (event) => {
  const body: PostCreateRequest = await readBody(event);

  if (!serverData.list) {
    serverData.list = [];
  }

  serverData.list.push({
    id: serverData.list.length,
    hot: 0,
    ...body
  });

  return response(200, "", {});
});