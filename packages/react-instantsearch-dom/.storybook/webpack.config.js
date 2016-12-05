/* eslint-disable import/no-commonjs */
const autoprefixer = require('autoprefixer');

module.exports = {
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: ['style?insertAt=top', 'css', 'postcss', 'sass'],
      },
    ],
  },
  postcss: [autoprefixer()],
};
/* eslint-enable import/no-commonjs */
