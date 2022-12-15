module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/react', 'algolia/typescript'],
  plugins: ['react-hooks', 'deprecation'],
  rules: {
    'no-param-reassign': 'off',
    'import/no-extraneous-dependencies': 'off',
    'new-cap': [
      'error',
      {
        capIsNewExceptionPattern:
          '(\\.|^)EXPERIMENTAL_.+|components\\.[A-Z][a-z]+',
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
    'no-restricted-syntax': [
      'error',
      {
        selector: 'AssignmentExpression [name=defaultProps]',
        message: 'defaultProps are not allowed, use function defaults instead.',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'valid-jsdoc': 'off',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': ['error'],
        'react/prop-types': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      // this is the same files as ignored in tsconfig.json
      excludedFiles: ['examples/**/*', '*/es'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'deprecation/deprecation': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      },
    },
    {
      files: [
        'packages/instantsearch.js/src/**/*.ts',
        'packages/instantsearch.js/src/**/*.tsx',
        'packages/instantsearch.js/src/**/*.js',
      ],
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
      files: ['packages/instantsearch.js/src/**/*'],
      excludedFiles: [
        '**/__tests__/**/*',
        'packages/instantsearch.js/src/widgets/**/*',
      ],
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
    {
      files: ['tests/e2e/**/*'],
      parserOptions: {
        project: 'tests/e2e/tsconfig.json',
      },
      rules: {
        'valid-jsdoc': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: 'WebdriverIOAsync',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/no-floating-promises': 'error',
      },
    },
    {
      files: [
        'tests/e2e/specs/**/*.spec.ts',
        'tests/e2e/all-flavors.spec.ts',
        'tests/e2e/helpers/**/*.ts',
        'tests/e2e/wdio.*.conf.js',
      ],
      extends: ['plugin:wdio/recommended'],
      plugins: ['wdio'],
      env: {
        jasmine: true,
      },
      rules: {
        // we are exporting test "factories", so we need to allow export
        'jest/no-export': 0,
        // we use jasmine
        'jest/expect-expect': 0,
        '@typescript-eslint/no-namespace': 0,
      },
    },
    {
      files: ['tests/e2e/**/*.js'],
      rules: {
        'import/no-commonjs': 0,
      },
    },
    {
      // `create-instantsearch-app` does not use TypeScript, this rule makes linting totally fails and asks for a tsconfig.json file which we do not have.
      files: ['packages/create-instantsearch-app/**/*.js'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
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
