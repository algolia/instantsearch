/* eslint-disable import/no-commonjs */

module.exports = {
  rootDir: process.cwd(),
  testEnvironment: 'jest-environment-jsdom-global',
  testMatch: [
    '!**/__tests__/**/*-integration-test.[jt]s?(x)',
    '**/__tests__/**/*.[jt]s?(x)',
  ],
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
  moduleNameMapper: {
    'preact-compat': 'react',
  },
  globals: {
    __DEV__: true,
  },
};
