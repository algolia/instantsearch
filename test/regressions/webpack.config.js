/* eslint-disable import/no-commonjs */
const path = require('path');
const storybookConfig = require('../../storybook/webpack.config');

module.exports = {
  entry: path.resolve(__dirname, 'tests.js'),
  output: {
    path: path.resolve(__dirname, '../.happo'),
    filename: 'tests.js',
  },
  module: {
    rules: storybookConfig.module.rules.concat([
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
        },
      },
    ]),
  },
};
