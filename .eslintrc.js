module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/react', 'algolia/typescript'],
  plugins: ['react-hooks'],
  rules: {
    'no-param-reassign': 'off',
    'import/no-extraneous-dependencies': 'off',
    'new-cap': [
      'error',
      {
        capIsNewExceptions: [
          'EXPERIMENTAL_use',
          'EXPERIMENTAL_connectConfigureRelatedItems',
          'EXPERIMENTAL_configureRelatedItems',
        ],
      },
    ],
    'react/no-string-refs': 'error',
    // Avoid errors about `UNSAFE` lifecycles (e.g. `UNSAFE_componentWillMount`)
    'react/no-deprecated': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jest/no-test-callback': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/camelcase': [
      'error',
      {
        allow: [
          'instant_search',
          'instant_search_movies',
          'free_shipping',
          '^EXPERIMENTAL_',
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'valid-jsdoc': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
      pragma: 'h',
    },
    'import/resolver': {
      node: {
        // The migration is an incremental process so we import TypeScript modules
        // from JavaScript files.
        // By default, `import/resolver` only supports JavaScript modules.
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
  globals: {
    __DEV__: false,
  },
};
