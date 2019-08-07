module.exports = {
  extends: ['algolia', 'algolia/typescript'],
  rules: {
    'no-param-reassign': 0,
    'import/no-extraneous-dependencies': 0,
    'valid-jsdoc': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
  },
  overrides: [
    {
      files: ['specs/**/*.spec.ts'],
      extends: ['plugin:wdio/recommended'],
      plugins: ['wdio'],
      env: {
        jasmine: true,
      },
    },
    {
      files: ['**/*.js'],
      rules: {
        'import/no-commonjs': 0,
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
