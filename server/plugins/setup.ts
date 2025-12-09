import fs from "fs";
import path from "path";

import { serverData } from "../data";

export default defineNitroPlugin((app) => {
  const filePath = path.resolve(process.cwd(), "data.json");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
    } else {
      try {
        Object.assign(serverData, JSON.parse(data.toString()));
      } catch (parseErr) {
        console.error(parseErr);
      }
    }
  });

  const saveData = async () => {
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(serverData), "utf8");
      console.warn(serverData);
    } catch (err) {
      console.error(err);
    }
  };
  app.hooks.hook("afterResponse", saveData);
});