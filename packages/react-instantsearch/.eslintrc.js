var join = require('path').join;

module.exports = {
  "extends": join(__dirname, "../../.eslintrc.js"),
  "globals": {
    "__DOC__": true
  }
};
