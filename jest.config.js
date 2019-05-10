/* eslint-disable import/no-commonjs */

module.exports = {
  rootDir: process.cwd(),
  testEnvironment: 'jest-environment-jsdom-global',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist*',
    '<rootDir>/functional-tests',
  ],
  setupFilesAfterEnv: ['./scripts/jest/setupTests.js'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    __DEV__: true,
  },
};
