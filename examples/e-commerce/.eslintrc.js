module.exports = {
  extends: ['algolia', 'algolia/typescript'],
  rules: {
    'valid-jsdoc': 'off',
    // The "no-unresolved" rule is needed for the CI
    // because it runs ESLint without installing the
    // examples' dependencies first.
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
