import { set } from "lodash-es";

import { serverData } from "../data";
import { response } from "../utils/response";

export default defineEventHandler(() => {
  set(serverData, "loggedInAt", 0);

  return response(200, "", {});
});