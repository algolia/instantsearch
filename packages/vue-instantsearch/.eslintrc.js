module.exports = {
  extends: ['algolia/jest', 'algolia/vue', 'prettier'],
  rules: {
    'no-warning-comments': 'warn', // we have many Todo:, this will remind us to deal with them
    'no-use-before-define': 'off',
    'vue/attribute-hyphenation': [
      'error',
      'always',
      {
        ignore: ['createURL'],
      },
    ],
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-indent': 'off',
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    camelcase: [
      'error',
      {
        allow: ['^\\$_ais', '^EXPERIMENTAL_', 'instant_search'],
      },
    ],
    'vue/max-attributes-per-line': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    // Because we have root typescript, but not in this package, the import/* rules are too strict
    'import/named': 'off',
    'import/namespace': 'off',
  },
  overrides: [
    {
      files: ['src/components/__tests__/*.js'],
      rules: {
        'import/named': 'off', // we import __setState and use it, but that's just a mock
      },
    },
  ],
};
