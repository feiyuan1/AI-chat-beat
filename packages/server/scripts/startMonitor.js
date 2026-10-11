import path from "path";
import run from "./run.js";

const worksapce = process.env.AI_CHAT_BEAT_HOME;
if (!worksapce) {
  throw new Error("AI_CHAT_BEAT_HOME is not configured");
}

const startMonitor = async () => {
  if (process.platform === "win32") {
    // windows 将中文编码转为 utf-8
    await run("chcp", ["65001"]);
  }

  run("npm", ["run", "start:monitor"], {
    cwd: path.join(worksapce, "packages", "server"),
  });
};

startMonitor();
