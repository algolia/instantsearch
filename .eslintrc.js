module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/react'],
  rules: {
    'no-param-reassign': 0,
    'import/no-extraneous-dependencies': 0,
    'react/no-string-refs': 1,
  },
  globals: {
    __DEV__: false,
  },
};
