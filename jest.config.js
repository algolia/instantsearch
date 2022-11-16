/* eslint-disable import/no-commonjs */
// @ts-check

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  rootDir: process.cwd(),
  testRunner: 'jest-circus',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./scripts/jest/setupTests.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/packages/*/node_modules/',
    '<rootDir>/packages/*/dist*',
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/packages/*/cjs',
    '<rootDir>/packages/*/dist',
    '<rootDir>/packages/*/es',
    '<rootDir>/packages/*/examples',
    '<rootDir>/packages/*/stories',
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
  snapshotFormat: {
    printBasicPrototype: false,
  },
  // reporter for circleci
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'junit/jest',
        suiteNameTemplate: '{filepath}',
        ancestorSeparator: ' › ',
        addFileAttribute: 'true',
      },
    ],
  ],
};

module.exports = config;
