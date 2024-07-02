const path = require('path');

module.exports = {
  extends: path.join(__dirname, '..', '.eslintrc.js'),
  parser: '@typescript-eslint/parser',
  rules: {
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/consistent-type-imports': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
  },
};
