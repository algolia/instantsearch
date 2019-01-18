/* eslint-disable import/no-commonjs */

module.exports = {
  // @TODO: Jest supports TypeScript by default in the next major (24.x.x). We
  // can remove the specific configuration once it's released.
  // https://github.com/facebook/jest/pull/7533
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)$',
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist*',
    '<rootDir>/functional-tests',
  ],
  setupTestFrameworkScriptFile: './scripts/jestInit.js',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    __DEV__: true,
  },
};
