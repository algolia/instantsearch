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
  moduleNameMapper: {
    // for es modules we import .js of TS files, which jest-resolve doesn't deal with by default
    // to solve this, we strip the extension, and it can be resolved
    '^(\\..*)\\.js$': '$1',
  },
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
