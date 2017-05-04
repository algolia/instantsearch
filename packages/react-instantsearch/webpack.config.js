/* eslint-disable import/no-commonjs */
const { join } = require('path');
/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack'); // this is available because of root package.json
/* eslint-enable import/no-extraneous-dependencies */

module.exports = {
  entry: {
    Core: './index.js',
    Dom: './dom.js',
    Connectors: './connectors.js',
  },
  devtool: 'source-map',
  output: {
    path: join(__dirname, 'dist/umd'),
    filename: '[name].js',
    library: ['ReactInstantSearch', '[name]'],
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
    }),
  ],
};
