/* eslint import/no-commonjs: 0 */
/* eslint camelcase: 0 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPluging = require('html-webpack-plugin');
const AutoDllPlugin = require('autodll-webpack-plugin');
const HappyPack = require('happypack');

const __DEV__ = process.env.NODE_ENV === 'development';
const clean = arr => arr.filter(item => item !== false);

module.exports = {
  devtool: __DEV__ ? 'cheap-module-source-map' : 'source-map',

  entry: __DEV__
    ? {
        bundle: [
          'webpack-dev-server/client?http://localhost:8080',
          'webpack/hot/only-dev-server',
          './dev/app',
        ],
        instantsearch: './index.js',
      }
    : {
        bundle: './dev/app',
      },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
    library: '[name]',
    libraryTarget: 'umd',
  },

  module: {
    rules: clean([
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=babel',
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: 'raw-loader',
      },
      {
        test: /\.s?css$/,
        use: __DEV__
          ? 'happypack/loader?id=style'
          : ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: [
                {
                  loader: 'css-loader',
                  options: { sourceMap: true, minimize: true },
                },
                { loader: 'sass-loader', options: { sourceMap: true } },
              ],
            }),
      },
      __DEV__ && {
        test: require.resolve('react'),
        use: 'expose-loader?React',
      },
      __DEV__ && {
        test: require.resolve('react'),
        use: 'expose-loader?ReactDOM',
      },
    ]),
  },

  // replace `react` with `preact`
  resolve: {
    modules: ['node_modules', path.join(__dirname, '..', 'node_modules')],
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
    },
  },

  // webpack-dev-server configuration,
  // used only on dev env with `$ yarn dev`
  devServer: {
    contentBase: __dirname,
    compress: true,
    host: '0.0.0.0',
    port: 8080,
    historyApiFallback: true,
    hot: true,

    stats: {
      assets: true,
      colors: true,
      version: false,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  },

  plugins: clean([
    new webpack.LoaderOptionsPlugin({ debug: __DEV__ }),

    // HOT MODULE FOR DEV
    __DEV__ && new webpack.HotModuleReplacementPlugin(),
    __DEV__ && new webpack.NoEmitOnErrorsPlugin(),

    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
    }),

    // Generate an `index.html` with all the scripts and styles included
    new HtmlWebpackPluging({
      template: path.join(__dirname, 'template.html'),
      inject: true,
      hash: true,
    }),

    // Build vendors in a seperate bundle which won't be re-builded on changes
    __DEV__ &&
      new AutoDllPlugin({
        inject: true,
        context: path.join(__dirname, '..'),
        filename: '[name].[hash].js',
        entry: {
          vendor: [
            ...Object.keys(require('../package.json').dependencies).filter(
              pkg => !pkg.includes('rheostat')
            ),
            'dev-novel',
          ],
        },
      }),

    new HappyPack({
      loaders: ['babel-loader?cacheDirectory=true'],
      id: 'babel',
    }),

    __DEV__ &&
      new HappyPack({
        loaders: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
        id: 'style',
      }),

    !__DEV__ &&
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          comparisons: false,
        },
        output: {
          comments: false,
          ascii_only: true,
        },
        sourceMap: true,
      }),

    !__DEV__ && new ExtractTextPlugin('[name].[contenthash].css'),
  ]),
};
