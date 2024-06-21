const path = require('path');

module.exports = {
  extends: [
    path.join(__dirname, '..', '.eslintrc.js'),
    'algolia/vue',
    'prettier',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  rules: {
    'import/no-unresolved': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-indent': 'off',
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/multi-word-component-names': 'off',
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
    },
    {
      files: ['*.config.js', '*.conf.js', '.eslintrc.js'],
      rules: {
        'import/no-commonjs': 'off',
      },
    },
  ],
};
