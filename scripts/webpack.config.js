/* eslint import/no-commonjs: 0 */
/* eslint max-len: 0 */
/* eslint camelcase: 0 */

const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

const {
  NODE_ENV = 'development',
  VERSION = `UNRELEASED / generated at: ${new Date().toUTCString()}`,
} = process.env;

const noop = () => ({ apply: () => undefined });

module.exports = {
  devtool: 'source-map',

  entry: {
    instantsearch: [path.join(__dirname, '../index.js')],
  },

  output: {
    path: path.join(__dirname, '../dist'),
    filename: '[name].min.js',
    library: '[name]',
    libraryTarget: 'umd',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=babel',
      },
    ],
  },

  resolve: {
    modules: ['node_modules', path.join(__dirname, '..', 'node_modules')],
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
    },
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(NODE_ENV) },
    }),

    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),

    NODE_ENV === 'production'
      ? new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
            comparisons: false,
          },
          output: {
            comments: false,
            ascii_only: true,
          },
          sourceMap: true,
        })
      : noop,

    new webpack.BannerPlugin(
      `instantsearch.js ${VERSION} | © Algolia Inc. and other contributors; Licensed MIT | github.com/algolia/instantsearch.js`
    ),

    // Generate un-minified js along with UglifyJsPlugin
    NODE_ENV === 'production' ? new UnminifiedWebpackPlugin() : noop,

    new HappyPack({
      loaders: ['babel-loader'],
      id: 'babel',
    }),
  ],
};
