module.exports = {
  extends: ['algolia', 'plugin:vitest/recommended'],
  rules: {
    'import/no-commonjs': 'off',
    'no-console': 'off',
    'no-process-exit': 'off',
  },
};
