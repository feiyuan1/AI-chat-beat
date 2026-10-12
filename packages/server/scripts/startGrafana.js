import path from "path";
import appHome from "./getAppHomePath.js";
import run from "./run.js";

run("grafana", [
  "server",
  "--homepath",
  process.platform === "win32"
    ? path.join(appHome, "grafana", "grafana")
    : path.join(appHome, "grafana"),
]);
