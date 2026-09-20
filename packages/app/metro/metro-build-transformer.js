const upstreamTransformer = require("metro-babel-transformer");
const esbuild = require("esbuild");

module.exports.transform = async function ({ src, filename, options }) {
  if (!filename.endsWith(".esbuild.ts")) {
    return upstreamTransformer.transform({ src, filename, options });
  }

  const result = await esbuild.build({
    entryPoints: [filename],
    bundle: true,
    format: "iife",
    target: "es2020",
    write: false,
    minify: false,
    metafile: true,
  });

  console.log("esbuild end");
  const code = result.outputFiles[0].text;

  return upstreamTransformer.transform({
    src: `export default ${JSON.stringify(code)};`,
    filename: filename + ".js",
    options,
  });
};
