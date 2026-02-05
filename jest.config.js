// @ts-check

/** @type {any} */
const packagejson = require('./package.json');
/** @type {'3' | '4' | '5'} */
const algoliaSearchMajor =
  packagejson.devDependencies.algoliasearch.split('.')[0];

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  rootDir: process.cwd(),
  testRunner: 'jest-circus',
  testEnvironment: '@instantsearch/testutils/jest-environment-node.ts',
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
    algoliaSearchMajor !== '5' && '<rootDir>/packages/algolia-experiences',
  ].filter((x) => x !== false),
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
    'node_modules/(?!(search-insights|algoliasearch|zod)/)',
  ],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue2-jest',
  },
  moduleFileExtensions: ['tsx', 'ts', 'js', 'vue'],
  moduleNameMapper: {
    '^react-instantsearch$': '<rootDir>/packages/react-instantsearch/src/',
    '^react-instantsearch-core/dist/es(.*)$':
      '<rootDir>/packages/react-instantsearch-core/src$1',
    '^react-instantsearch-(.*[^v6])$':
      '<rootDir>/packages/react-instantsearch-$1/src/',
    '^instantsearch.js$': '<rootDir>/packages/instantsearch.js/src/',
    '^instantsearch.js/es(.*)$': '<rootDir>/packages/instantsearch.js/src$1',
    '^instantsearch.js/(.*)$': '<rootDir>/packages/instantsearch.js/$1',
    '^instantsearch-ui-components/(.*)$':
      '<rootDir>/packages/instantsearch-ui-components/$1',
    '^instantsearch-core$':
      '<rootDir>/packages/instantsearch-core/src/index.ts',
    '^instantsearch-core/(.*)$': '<rootDir>/packages/instantsearch-core/$1',
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
