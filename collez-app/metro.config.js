const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve classic entries (main/react-native) instead of
// package export-condition variants that can leak import.meta into web bundles.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

