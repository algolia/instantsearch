var join = require('path').join;

module.exports = {
  extends: join(__dirname, '../../../.eslintrc.js'),
  rules: {
    'import/no-unresolved': 'off',
    'import/named': 'off',
  },
};
