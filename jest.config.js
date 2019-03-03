/* eslint-disable import/no-commonjs */

module.exports = {
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist*',
    '<rootDir>/functional-tests',
  ],
  setupFilesAfterEnv: ['./scripts/jest/init.js'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    __DEV__: true,
  },
};
