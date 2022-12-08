module.exports = {
  extends: ['algolia', 'algolia/jest'],
  rules: {
    'import/no-commonjs': 'off',
    'no-console': 'off',
    'no-process-exit': 'off',
  },
};
