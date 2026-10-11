import { readFileSync } from "fs";
import path from "path";
import appHome from "./getAppHomePath.js";
import run from "./run.js";

const startVictoriaMetrics = async () => {
  const password = readFileSync(
    path.join(process.cwd(), "secret", "victoria-password.txt"),
    "utf-8",
  );
  await run("npx", ["shx", "rm", "-rf", "build"]);
  await run("npx", ["tsc"]);
  run("node", [
    path.join(process.cwd(), "build", "monitor-metric-reporter.js"),
    "--storageDataPath",
    path.join(appHome, "victoria-metrics", "victoria-metrics-data"),
    "--retentionPeriod",
    "100y",
    "-httpAuth.username",
    "admin",
    "-httpAuth.password",
    password,
  ]);
};

startVictoriaMetrics();
