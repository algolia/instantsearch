/* eslint-disable import/no-commonjs */
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const productionPluginDefine = isProduction
  ? [
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify('production') },
      }),
    ]
  : [];

const commonLoaders = [
  {
    test: /\.json$/,
    loader: 'json-loader',
  },
];

module.exports = [
  {
    entry: ['babel-polyfill', './src/server.js'],
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'server.js',
      libraryTarget: 'commonjs2',
      publicPath: '/',
    },
    target: 'node',
    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
    },
    externals: nodeExternals(),
    plugins: productionPluginDefine,
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
        },
      ].concat(commonLoaders),
    },
  },
  {
    entry: ['babel-polyfill', './src/app/browser.js'],
    output: {
      path: path.join(__dirname, 'dist/assets'),
      publicPath: '/',
      filename: 'bundle.js',
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
  },
];
