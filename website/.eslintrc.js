const path = require('path');

module.exports = {
  extends: path.join(__dirname, '..', '.eslintrc.js'),
  rules: {
    'import/no-commonjs': 'off',
  },
};
