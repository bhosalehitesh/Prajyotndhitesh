const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Only watch the Frontend directory
    path.resolve(__dirname),
  ],
  resolver: {
    // Exclude root directory and backend from being resolved
    blockList: [
      // Exclude parent directory (root) to avoid duplicate package.json
      /.*\/\.\.\/package\.json$/,
      // Exclude Backend directory
      /.*\/Backend\/.*/,
    ],
    // Only resolve modules from Frontend directory
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
