/* eslint-disable import/no-commonjs */
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
};
/* eslint-enable import/no-commonjs */
