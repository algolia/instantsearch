/* eslint-disable import/no-commonjs */

module.exports = {
  // @TODO: Jest supports TypeScript by default in the next major (24.x.x). We
  // can remove the specific configuration once it's released.
  // https://github.com/facebook/jest/pull/7533
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.(js|ts|tsx)',
    '<rootDir>/packages/**/?(*.)+(spec|test).(js|ts|tsx)',
  ],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
