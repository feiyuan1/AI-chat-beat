import path from "path";
import appHome from "./getAppHomePath.js";
import run from "./run.js";

run("grafana ", [
  "server",
  "--homepath",
  path.join(appHome, "grafana", "grafana"),
]);
