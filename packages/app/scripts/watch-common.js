const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const process = require("process");

const commonDir = path.resolve(process.cwd(), "../common/src");
const injectedFile = path.resolve(__dirname, "../injected.esbuild.ts");
console.log("[watching common dir]");

chokidar.watch(commonDir).on("change", () => {
  fs.appendFileSync(injectedFile, "//.");
  console.log("[watch] touched injected.esbuild.ts");
});
