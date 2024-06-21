module.exports = {
  extends: ['algolia', 'algolia/jest'],
  parser: '@typescript-eslint/parser',
  rules: {
    'import/no-commonjs': 'off',
    'no-console': 'off',
    'no-process-exit': 'off',
  },
};
