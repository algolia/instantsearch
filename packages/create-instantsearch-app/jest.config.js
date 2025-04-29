module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/templates/',
  ],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
  snapshotSerializers: ['@instantsearch/testutils/ansiSnapshotSerializer.cjs'],
};
