module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/react', 'algolia/typescript'],
  plugins: ['react-hooks'],
  rules: {
    'no-param-reassign': 'off',
    'import/no-extraneous-dependencies': 'off',
    'new-cap': [
      'error',
      {
        capIsNewExceptionPattern: '(\\.|^)EXPERIMENTAL_.+',
      },
    ],
    'react/no-string-refs': 'error',
    // Avoid errors about `UNSAFE` lifecycles (e.g. `UNSAFE_componentWillMount`)
    'react/no-deprecated': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jest/no-test-callback': 'off',
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        modifiers: ['destructured'],
        format: null,
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        filter: {
          regex: '^EXPERIMENTAL_|__DEV__',
          match: false,
        },
      },
      {
        selector: 'typeParameter',
        format: ['PascalCase'],
        prefix: ['T', 'K'],
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false,
        },
      },
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'valid-jsdoc': 'off',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': ['error'],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      // this is the same files as ignored in tsconfig.json
      excludedFiles: [
        'examples/**/*',
        'es',
        // these two files are temporarily excluded because
        // they import files from node_modules/search-insights directly
        // and it causes the type-checking to fail.
        'src/middlewares/__tests__/createInsightsMiddleware.ts',
        'test/mock/createInsightsClient.ts',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      },
    },
    {
      files: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js'],
      rules: {
        'import/extensions': ['error', 'never'],
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': 'off',
      },
    },
    {
      files: ['src/**/*'],
      excludedFiles: ['**/__tests__/**/*', 'src/widgets/**/*'],
      rules: {
        'no-restricted-globals': [
          'error',
          {
            name: 'window',
            message: 'Use `safelyRunOnBrowser()` to access `window`.',
          },
        ],
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
