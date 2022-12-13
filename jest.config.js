// @ts-check

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  rootDir: process.cwd(),
  testRunner: 'jest-circus',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/utils/setupTests.ts'],
  snapshotSerializers: ['enzyme-to-json/serializer', 'jest-serializer-html'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/packages/*/node_modules/',
    '<rootDir>/packages/*/dist*',
    '<rootDir>/tests/e2e/*',
    '<rootDir>/examples/',
    '/__utils__/',
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/packages/*/cjs',
    '<rootDir>/packages/*/dist',
    '<rootDir>/packages/*/es',
    '<rootDir>/packages/*/stories',
    '<rootDir>/examples',
    '<rootDir>/website',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(search-insights|instantsearch.js)/)',
  ],
  moduleNameMapper: {
    '^react-instantsearch-(.*)$':
      '<rootDir>/packages/react-instantsearch-$1/src/',
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

module.exports = config;
