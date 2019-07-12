/* eslint-disable import/no-commonjs */

const config = require('./jest.config');

let instantSearchPath;

switch (process.env.TEST_BUILD) {
  case 'cjs':
    instantSearchPath = '<rootDir>/cjs/index.js';
    break;
  case 'umd':
    instantSearchPath = '<rootDir>/dist/instantsearch.production.min.js';
    break;
  default:
    instantSearchPath = '<rootDir>/src/index.ts';
}

module.exports = Object.assign(config, {
  testMatch: ['**/__tests__/**/*-integration-test.[jt]s?(x)'],
  moduleNameMapper: {
    'instantsearch.js': instantSearchPath,
  },
});
