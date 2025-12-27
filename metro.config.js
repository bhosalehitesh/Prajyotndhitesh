const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const frontendPath = path.resolve(__dirname, 'Frontend');
const rootPath = __dirname;

const config = {
  projectRoot: frontendPath,
  watchFolders: [
    frontendPath,
  ],
  resolver: {
    // Block only the root package.json to avoid conflicts
    blockList: [
      // Specifically block root package.json (not Frontend/package.json)
      new RegExp(`^${rootPath.replace(/\\/g, '/')}/package\\.json$`),
      // Exclude Backend directory entirely (works on both Windows and Unix)
      new RegExp(`.*${path.sep}Backend${path.sep}.*`),
    ],
    // Only resolve from Frontend directory
    nodeModulesPaths: [
      path.resolve(frontendPath, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(frontendPath), config);
