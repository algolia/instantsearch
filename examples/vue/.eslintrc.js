const path = require('path');
module.exports = {
  extends: [
    path.join(__dirname, '..', '.eslintrc.js'),
    'algolia/vue',
    'prettier',
  ],
  rules: {
    'import/no-unresolved': 'off',
    '@typescript-eslint/naming-convention': 'off',
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
      files: ['*.config.js', '*.conf.js'],
      rules: {
        'import/no-commonjs': 'off',
      },
    },
  ],
};
