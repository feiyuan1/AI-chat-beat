const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    path.resolve("D:/FE/AI-chat-beat/packages/common"), // 指向 common 包实际位置
  ],
};

const mergedConfig = getDefaultConfig(__dirname, config);
mergedConfig.transformer.babelTransformerPath = path.resolve(
  "./metro/metro-build-transformer.js",
);

module.exports = mergedConfig;
