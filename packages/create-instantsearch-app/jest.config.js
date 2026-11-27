module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/templates/',
    '/__utils__/',
  ],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
  snapshotSerializers: ['@instantsearch/testutils/ansiSnapshotSerializer.cjs'],
};
