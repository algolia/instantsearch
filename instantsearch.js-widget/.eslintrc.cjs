module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/typescript'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  overrides: [
    {
      files: ['*.cjs'],
      rules: {
        'import/no-commonjs': 'off',
      },
    },
  ],
};
