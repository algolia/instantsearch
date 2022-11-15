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
    '@typescript-eslint/no-floating-promises': 'error',
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  overrides: [
    {
      files: ['specs/**/*.spec.ts', 'all-flavors.spec.ts'],
      extends: ['plugin:wdio/recommended'],
      plugins: ['wdio'],
      env: {
        jasmine: true,
      },
    },
    {
      files: ['helpers/**/*.ts', 'wdio.*.conf.js'],
      extends: ['plugin:wdio/recommended'],
      plugins: ['wdio'],
      rules: {
        '@typescript-eslint/no-namespace': 0,
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
