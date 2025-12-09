import { get } from "lodash-es";

import { serverData } from "../data";

export default defineEventHandler((event) => {
  const AUTH_API = [
    "list",
    "advertisement"
  ];

  const loggedInAt = get(serverData, "loggedInAt");
  if (AUTH_API.includes(event.path.slice(5)) && (!loggedInAt || Date.now() - loggedInAt > 120000)) {
    return response(200401, "登录过期", {});
  }
});