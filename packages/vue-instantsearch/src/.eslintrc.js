const { join } = require('path');

module.exports = {
  extends: join(__dirname, '../.eslintrc.js'),
  settings: {
    'import/core-modules': ['vue-instantsearch'],
  },
};
