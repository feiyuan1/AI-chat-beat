import { readFileSync } from "fs";
import path from "path";
import appHome from "./getAppHomePath.js";
import run from "./run.js";

const password = readFileSync(
  path.join(process.cwd(), "secret", "victoria-password.txt"),
  "utf-8",
);

run("victoria-logs", [
  "--storageDataPath",
  path.join(appHome, "victoria-logs", "victoria-logs-data"),
  "--retentionPeriod",
  "100y",
  "-httpAuth.username",
  "admin",
  "-httpAuth.password",
  password,
]);
