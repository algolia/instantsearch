/* eslint-disable import/no-commonjs */
const autoprefixer = require('autoprefixer');

module.exports = {
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'postcss', 'sass'],
      },
    ],
  },
  postcss: [autoprefixer()],
};
/* eslint-enable import/no-commonjs */
