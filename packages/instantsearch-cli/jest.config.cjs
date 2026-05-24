module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/detector/__tests__/fixtures/',
  ],
  transform: {
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
};
