module.exports = {
  root: true,
  extends: ['algolia/jest', 'algolia/vue', 'prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'no-warning-comments': 'warn', // we have many Todo:, this will remind us to deal with them

    'vue/attribute-hyphenation': [
      'error',
      'always',
      {
        ignore: ['createURL'],
      },
    ],
    camelcase: [
      'error',
      {
        allow: ['^\\$_ais', '^EXPERIMENTAL_', 'instant_search'],
      },
    ],
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],

    'no-use-before-define': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-indent': 'off',
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    // TypeScript rules aren't relevant here
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    // Because we have root typescript, but not in this package, the import/* rules are too strict
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/no-unresolved': 'off',
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
    },
    {
      files: ['src/components/__tests__/*.js'],
      rules: {
        'import/named': 'off', // we import __setState and use it, but that's just a mock
      },
    },
    {
      files: ['.eslintrc.js'],
      rules: {
        'import/no-commonjs': 'off',
      },
    },
  ],
};
