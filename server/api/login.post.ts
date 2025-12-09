import { set } from "lodash-es";

import { PostLoginRequest } from "~/service/types";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(async (event) => {
  const body: PostLoginRequest = await readBody(event);

  if (body.username !== "1" || body.password !== "2") {
    return response(200402, "账号或密码错误", {});
  }

  set(serverData, "loggedInAt", new Date().getTime());

  return response(200, "", {});
});