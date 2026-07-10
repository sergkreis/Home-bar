const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Lucide icons are imported individually to keep the web and native bundles small.
config.resolver.unstable_enablePackageExports = false;
config.resolver.blockList = [
  /[/\\]playwright-report[/\\].*/,
  /[/\\]test-results[/\\].*/,
];

module.exports = config;
