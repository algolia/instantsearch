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
  plugins: ['react-hooks', 'deprecation'],
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
    'no-use-before-define': 'off',
    // @TODO: re-enable once the rule is properly setup for monorepos
    // https://github.com/benmosher/eslint-plugin-import/issues/1103
    // https://github.com/benmosher/eslint-plugin-import/issues/1174
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/explicit-member-accessibility': ['off'],
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
        // We disallow importing the root ES import because the transformed CJS
        // build then includes everything (widgets, components, etc.) and these
        // aren't required or useful.
        paths: ['instantsearch.js/es'],
      },
    ],
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '(useIsomorphicLayoutEffect)',
      },
    ],
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
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'AssignmentExpression MemberExpression Identifier[name=defaultProps]',
        message: 'defaultProps are not allowed, use function defaults instead.',
      },
    ],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'parent', 'sibling', 'index', 'type'],
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
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      // this is the same files as ignored in tsconfig.json
      excludedFiles: ['examples/**/*', '*/es'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'valid-jsdoc': 'off',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': ['error'],
        'react/prop-types': 'off',
        // This rule has issues with the TypeScript parser, but tsc catches
        // these sorts of errors anyway.
        // See: https://github.com/typescript-eslint/typescript-eslint/issues/342
        'no-undef': 'off',
        // This rule only supports ?. with the TypeScript parser.
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
          },
        ],
        'deprecation/deprecation': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/method-signature-style': 'error',
        '@typescript-eslint/unbound-method': 'error',
        'import/no-unresolved': ['error'],
      },
    },
    {
      files: ['**/__tests__/**.ts', '**/__tests__/**.tsx', 'tests/**/*.ts'],
      rules: {
        'jest/no-done-callback': 'warn',
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'error',
        'jest/no-standalone-expect': [
          'off',
          { additionalTestBlockFunctions: ['skippableTest'] },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector:
              'CallExpression[callee.name="runTestSuites"][arguments.0] Property[key.name="only"]',
            message: 'Do not commit a restricted test',
          },
        ],
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
      files: [
        'packages/react-instantsearch/**/*',
        'packages/react-instantsearch-*/**/*',
      ],
      rules: {
        '@typescript-eslint/consistent-type-assertions': 'off',
        // We don't ship PropTypes in the next version of the library.
        'react/prop-types': 'off',
        'import/extensions': ['error', 'never'],
      },
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
      },
    },
    {
      files: 'packages/**/*',
      excludedFiles: ['*.test.*', '**/__tests__/**'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ForInStatement',
            message:
              'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
          },
          {
            selector: 'LabeledStatement',
            message:
              'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
          },
          {
            selector: 'WithStatement',
            message:
              '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
          },
          {
            selector:
              ":matches(TSSatisfiesExpression, TSAsExpression) ObjectExpression Property[method=true][key.name='getRenderState'] > FunctionExpression:not([returnType]) :matches(MemberExpression[object.name='renderState'], SpreadElement > Identifier[name='renderState'])",
            message:
              'Connectors using `satisfies` that use `renderState` must explicitly annotate the return type of `getRenderState`.',
          },
        ],
      },
    },
    {
      files: 'packages/**/*',
      excludedFiles: [
        '*.test.*',
        '**/__tests__/**',
        '**/stories/**',
        'packages/algoliasearch-helper/documentation-src/**',
      ],
      plugins: ['compat'],
      extends: ['plugin:compat/recommended'],
      env: {
        browser: true,
      },
      settings: {
        lintAllEsApis: true,
      },
    },
    // Disable stricter rules introduced for the next versions of the libraries.
    {
      files: [
        'packages/instantsearch.js/src/**/*.ts',
        'packages/instantsearch.js/src/**/*.tsx',
        'packages/instantsearch.js/src/**/*.js',
      ],
      rules: {
        'import/extensions': ['error', 'never'],
      },
      settings: {
        react: {
          pragma: 'h',
        },
      },
    },
    {
      files: ['*.js', '*.d.ts'],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': 'off',
      },
    },
    {
      files: [
        'packages/instantsearch.js/src/**/*',
        'packages/instantsearch-core/src/**/*',
      ],
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
      files: ['packages/*/test/module/**/*.cjs'],
      rules: {
        'import/extensions': ['error', 'always'],
      },
    },
    {
      files: ['*.cjs'],
      rules: {
        'import/no-commonjs': 'off',
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
      files: [
        'packages/create-instantsearch-app/**/*.js',
        'packages/vue-instantsearch/**/*.js',
      ],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
      },
    },
    {
      files: ['packages/react-instantsearch-router-nextjs/__tests__/e2e/**/*'],
      parserOptions: {
        project: 'packages/react-instantsearch-router-nextjs/tsconfig.json',
      },
    },
    {
      files: ['packages/algoliasearch-helper/**/*.js'],
      rules: {
        // Helper uses CommonJS for now
        'import/no-commonjs': 'off',
        strict: 'off',
        // Helper uses ES5 for now
        'no-var': 'off',
        'vars-on-top': 'off',
        'object-shorthand': 'off',
        'prefer-template': 'off',
        'prefer-spread': 'off',
        'prefer-rest-params': 'off',
      },
    },
    {
      // The only TypeScript files in the Helper package are declaration files and a test file.
      files: [
        'packages/algoliasearch-helper/**/*.d.ts',
        'packages/algoliasearch-helper/test/types.ts',
      ],
      rules: {
        // TypeScript declaration file
        'no-dupe-class-members': 'off',
        'no-new': 'off',
        'no-warning-comments': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/method-signature-style': 'off',
      },
    },
    {
      files: ['packages/algoliasearch-helper/documentation-src/**/*.js'],
      rules: {
        'no-console': 'off',
        'valid-jsdoc': 'off',
      },
    },
    {
      files: ['packages/algoliasearch-helper/test/**/*.js'],
      rules: {
        'no-console': 'off',
        'jest/no-done-callback': 'off',
        'jest/no-conditional-expect': 'off',
      },
      env: {
        jest: true,
      },
      globals: {
        test: true,
        beforeAll: true,
      },
    },
  ],
};

module.exports = config;
