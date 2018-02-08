/* eslint import/no-commonjs: 0 */
/* eslint max-len: 0 */
/* eslint camelcase: 0 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

const extractCSS = new ExtractTextPlugin('instantsearch.css');
const extractTheme = new ExtractTextPlugin('instantsearch-theme-algolia.css');

const {
  NODE_ENV = 'development',
  VERSION = `UNRELEASED / generated at: ${new Date().toUTCString()}`,
} = process.env;

const noop = () => ({ apply: () => undefined });

module.exports = {
  devtool: 'source-map',

  entry: {
    instantsearch: [
      // transpile SASS and extract to CSS
      path.join(__dirname, '../src/css/instantsearch-theme-algolia.scss'),
      path.join(__dirname, '../src/css/instantsearch.scss'),

      // transpile JS library
      path.join(__dirname, '../index.js'),
    ],
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
      {
        test: /\.s?css$/,
        include: /instantsearch-theme-algolia\.scss/,
        use: extractTheme.extract({
          fallback: 'style-loader',
          use: 'happypack/loader?id=style',
        }),
      },
      {
        test: /\.s?(c|a)ss$/,
        include: /instantsearch\.scss/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: 'happypack/loader?id=style',
        }),
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

    new HappyPack({
      loaders: [
        { loader: 'css-loader', options: { minimize: false, sourceMap: true } },
        { loader: 'postcss-loader', options: { sourceMap: true } },
        { loader: 'sass-loader', options: { sourceMap: true } },
      ],
      id: 'style',
    }),

    extractCSS,
    extractTheme,
  ],
};
