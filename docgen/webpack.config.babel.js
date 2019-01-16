import webpack from 'webpack';
import { join } from 'path';
import HappyPack from 'happypack';
import config from './config';

export default {
  entry: {
    'js/main': join(__dirname, 'assets/js/main.js'),
    'examples/e-commerce/index': join(
      __dirname,
      'src/examples/e-commerce/index.js'
    ),
    'examples/e-commerce-infinite/index': join(
      __dirname,
      'src/examples/e-commerce-infinite/index.js'
    ),
    'examples/media/index': join(__dirname, 'src/examples/media/index.js'),
    'examples/default-theme/index': join(
      __dirname,
      'src/examples/default-theme/index.js'
    ),
    'examples/tourism/index': join(__dirname, 'src/examples/tourism/index.js'),
    'examples/material-ui/index': join(
      __dirname,
      'src/examples/material-ui/index.js'
    ),
  },
  output: {
    path: config.docsDist,
    publicPath: config.publicPath,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'happypack/loader?id=babel',
      },
      {
        test: /\.css$/,
        loader: 'happypack/loader?id=style',
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'js/common',
      minChunks: module =>
        /\/react-instantsearch/.test(module.context) ||
        /\/react\//.test(module.context) ||
        /\/react-dom\//.test(module.context) ||
        /\/lodash\//.test(module.context) ||
        /\/fbjs\//.test(module.context) ||
        /\/algolia-frontend-components\//.test(module.context),
    }),
    new HappyPack({
      id: 'babel',
      loaders: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            rootMode: 'upward',
          },
        },
      ],
    }),
    new HappyPack({
      id: 'style',
      loaders: [
        {
          loader: 'style-loader',
          options: {
            insertAt: 'top',
          },
        },
        {
          loader: 'css-loader',
        },
      ],
    }),
  ],
};
