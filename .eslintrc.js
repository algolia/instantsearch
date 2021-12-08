/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
  extends: [
    'algolia',
    'algolia/jest',
    'algolia/react',
    'algolia/typescript',
    'plugin:react-hooks/recommended',
  ],
  globals: {
    __DEV__: false,
  },
  settings: {
    react: {
      version: 'detect',
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
  rules: {
    'no-param-reassign': 'off',
    // We rely on `@typescript-eslint/no-use-before-define`
    'no-use-before-define': 'off',
    // @TODO: remove once this is in `eslint-config-algolia`
    'valid-jsdoc': 'off',
    // @TODO: remove once this is in `eslint-config-algolia`
    '@typescript-eslint/explicit-member-accessibility': 'off',
    // @TODO: re-enable this once the code base is made for it
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    // @TODO: re-enable once the rule is properly setup for monorepos
    // https://github.com/benmosher/eslint-plugin-import/issues/1103
    // https://github.com/benmosher/eslint-plugin-import/issues/1174
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/explicit-member-accessibility': ['off'],
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
          regex:
            '^EXPERIMENTAL_|__DEV__|__APP_INITIAL_STATE__|__SERVER_STATE__|free_shipping',
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
    'import/extensions': 'off',
    'eslint-comments/disable-enable-pair': 'off',
    'react/jsx-no-bind': 'off',
    // We can't display an error message with the ESLint version we're using
    // See https://github.com/eslint/eslint/pull/14580
    'no-restricted-imports': [
      'error',
      {
        // We disallow InstantSearch.js CJS imports to only use ESM and not
        // end up having duplicated source code in our bundle.
        patterns: ['instantsearch.js/cjs/*'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // This rule has issues with the TypeScript parser, but tsc catches
        // these sorts of errors anyway.
        // See: https://github.com/typescript-eslint/typescript-eslint/issues/342
        'no-undef': 'off',
      },
    },
    {
      files: ['stories/**/*'],
      rules: {
        'react/prop-types': 'off',
        '@typescript-eslint/no-use-before-define': ['off'],
      },
    },
    {
      files: ['scripts/**/*', '*.config.js', '*.conf.js'],
      rules: {
        'import/no-commonjs': 'off',
      },
    },
    {
      files: ['packages/react-instantsearch-hooks/**/*'],
      rules: {
        // We don't ship PropTypes in the next version of the library.
        'react/prop-types': 'off',
        'import/order': [
          'error',
          {
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
            'newlines-between': 'always',
            groups: [
              'builtin',
              'external',
              'parent',
              'sibling',
              'index',
              'type',
            ],
            pathGroups: [
              {
                pattern: '@/**/*',
                group: 'parent',
                position: 'before',
              },
            ],
            pathGroupsExcludedImportTypes: ['builtin'],
          },
        ],
      },
    },
    // Disable stricter rules introduced for the next versions of the libraries.
    {
      files: [
        'packages/react-instantsearch-core/**/*',
        'packages/react-instantsearch-dom/**/*',
      ],
      rules: {
        '@typescript-eslint/ban-types': 'off',
      },
    },
  ],
};

module.exports = config;
