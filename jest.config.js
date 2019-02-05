/* eslint-disable import/no-commonjs */

module.exports = {
  roots: ['<rootDir>/packages'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
