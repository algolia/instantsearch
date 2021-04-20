/* eslint-disable import/no-commonjs */

module.exports = {
  rootDir: process.cwd(),
  testEnvironment: 'jest-environment-jsdom-global',
  setupFilesAfterEnv: ['./scripts/jest/setupTests.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist*',
    '<rootDir>/functional-tests',
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/cjs',
    '<rootDir>/dist',
    '<rootDir>/es',
    '<rootDir>/examples',
    '<rootDir>/stories',
    '<rootDir>/website',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  transformIgnorePatterns: ['node_modules/(?!(search-insights)/)'],
  globals: {
    __DEV__: true,
  },
};
