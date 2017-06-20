var join = require('path').join;

module.exports = {
  "extends": join(__dirname, "../.eslintrc.js"),
  "settings": {
    "import/resolver": {
      "webpack": {
        "config": join(__dirname, "webpack.config.babel.js")
      }
    }
  },
};
