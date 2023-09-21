'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/spec/**/*.[jt]s?(x)'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
