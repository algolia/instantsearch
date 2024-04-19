// @ts-check

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  rootDir: process.cwd(),
  testRunner: 'jest-circus',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/utils/setupTests.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/packages/*/node_modules/',
    '<rootDir>/packages/*/dist*',
    '<rootDir>/tests/e2e/*',
    '<rootDir>/examples/',
    '<rootDir>/packages/algoliasearch-helper',
    '<rootDir>/packages/create-instantsearch-app',
    '<rootDir>/packages/react-instantsearch-router-nextjs/__tests__',
    '<rootDir>/packages/react-instantsearch-nextjs/__tests__',
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
  transformIgnorePatterns: ['node_modules/(?!(search-insights)/)'],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue2-jest',
  },
  moduleFileExtensions: ['tsx', 'ts', 'js', 'vue'],
  moduleNameMapper: {
    '^react-instantsearch$': '<rootDir>/packages/react-instantsearch/src/',
    '^react-instantsearch-(.*[^v6])$':
      '<rootDir>/packages/react-instantsearch-$1/src/',
    '^instantsearch.js$': '<rootDir>/packages/instantsearch.js/src/',
    '^instantsearch.js/es(.*)$': '<rootDir>/packages/instantsearch.js/src$1',
    '^instantsearch.js/(.*)$': '<rootDir>/packages/instantsearch.js/$1',
    '^instantsearch-ui-components/(.*)$':
      '<rootDir>/packages/instantsearch-ui-components/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/packages/create-instantsearch-app/src/templates',
  ],
  globals: {
    __DEV__: true,
    'ts-jest': {},
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
